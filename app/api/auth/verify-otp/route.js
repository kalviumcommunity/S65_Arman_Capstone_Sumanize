import { kv } from "@vercel/kv";
import { SignJWT } from "jose";

export const runtime = "edge";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const [otpResult, userResult] = await Promise.allSettled([
      verifyOTPFromKV(email, otp),
      getOrCreateUser(email),
    ]);

    if (otpResult.status === "rejected") {
      return Response.json(
        { success: false, error: otpResult.reason.message },
        { status: 400 }
      );
    }

    if (userResult.status === "rejected") {
      console.error("User operation failed:", userResult.reason);
      return Response.json(
        { success: false, error: "Failed to process user data" },
        { status: 500 }
      );
    }

    const user = userResult.value;

    const token = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    await Promise.allSettled([
      kv.setex(`session:${user.id}`, 7 * 24 * 60 * 60, "valid"),
      kv.del(`otp:${email}`),
    ]);

    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.isPremium || false,
        currentPeriodEnd: user.currentPeriodEnd,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return Response.json(
      { success: false, error: "Failed to process verification" },
      { status: 500 }
    );
  }
}

async function verifyOTPFromKV(email, otp) {
  const key = `otp:${email}`;
  const stored = await kv.get(key);

  if (!stored) {
    throw new Error("OTP expired or not found");
  }

  const { otp: storedOtp, expires } = JSON.parse(stored);

  if (otp !== storedOtp) {
    await kv.del(key);
    throw new Error("Invalid OTP");
  }

  if (Date.now() > expires) {
    await kv.del(key);
    throw new Error("OTP expired");
  }

  return true;
}

async function getOrCreateUser(email) {
  const userKey = `user:${email}`;
  let user = await kv.get(userKey);

  if (user) {
    user = JSON.parse(user);
    user.isVerified = true;
    user.verifiedAt = Date.now();
    user.lastLoginAt = Date.now();
  } else {
    user = {
      id: generateUserId(),
      email,
      isVerified: true,
      isPremium: false,
      createdAt: Date.now(),
      verifiedAt: Date.now(),
      lastLoginAt: Date.now(),
    };
  }

  await kv.setex(userKey, 365 * 24 * 60 * 60, JSON.stringify(user));

  return user;
}

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
