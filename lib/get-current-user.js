import { kv } from "@vercel/kv";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getCurrentUser(request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return null;
    }

    // Verify JWT token using jose
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload || !payload.email) {
      return null;
    }

    // Try to get user from KV cache first
    const userKey = `user:${payload.email}`;
    const sessionKey = `session:${payload.id}`;
    
    // Check if session is still valid in cache
    const [cachedUser, sessionValid] = await Promise.allSettled([
      kv.get(userKey),
      kv.get(sessionKey),
    ]);

    if (cachedUser.status === "fulfilled" && cachedUser.value) {
      const userData = JSON.parse(cachedUser.value);
      
      // Extend session if it exists
      if (sessionValid.status === "fulfilled" && sessionValid.value) {
        await kv.expire(sessionKey, 7 * 24 * 60 * 60);
      }

      return {
        id: userData.id,
        email: userData.email,
        createdAt: userData.createdAt,
        isPremium: userData.isPremium || false,
        isVerified: userData.isVerified || false,
      };
    }

    // Fallback to database if not in cache
    try {
      const { connectDB } = await import("@/lib/database");
      const { default: User } = await import("@/models/User");
      
      await connectDB();
      const user = await User.findById(payload.id).select("-password");

      if (!user) {
        return null;
      }

      const userData = {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        isPremium: user.isPremium || false,
        isVerified: user.isVerified || false,
        currentPeriodEnd: user.currentPeriodEnd,
      };

      // Cache user data and create session
      await Promise.allSettled([
        kv.setex(userKey, 3600, JSON.stringify(userData)),
        kv.setex(sessionKey, 7 * 24 * 60 * 60, "valid"),
      ]);

      return userData;
    } catch (dbError) {
      console.error("Database fallback failed:", dbError);
      
      // Return minimal user data from JWT if database fails
      return {
        id: payload.id,
        email: payload.email,
        createdAt: null,
        isPremium: false,
        isVerified: true,
      };
    }
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

function getTokenFromRequest(request) {
  try {
    // Try to get from cookies first (for browser requests)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      if (cookies["sumanize-token"]) {
        return cookies["sumanize-token"];
      }
    }

    // Try Authorization header (for API requests)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  } catch (error) {
    console.error("Error extracting token:", error);
    return null;
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
