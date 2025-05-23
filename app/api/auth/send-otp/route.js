import { Resend } from "resend";
import { kv } from "@vercel/kv";

export const runtime = "edge";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expires = Date.now() + expiryMinutes * 60 * 1000;

    const [emailResult, kvResult] = await Promise.allSettled([
      sendOTPEmail(email, otp, expiryMinutes),
      storeOTPInKV(email, otp, expires, expiryMinutes),
    ]);

    if (emailResult.status === "rejected") {
      console.error("Email sending failed:", emailResult.reason);
      return Response.json(
        { success: false, error: "Failed to send email" },
        { status: 500 },
      );
    }

    if (kvResult.status === "rejected") {
      console.error("KV storage failed:", kvResult.reason);
      return Response.json(
        { success: false, error: "Failed to store OTP" },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return Response.json(
      { success: false, error: "Failed to process request" },
      { status: 500 },
    );
  }
}

async function sendOTPEmail(email, otp, expiryMinutes) {
  return await resend.emails.send({
    from: "Sumanize <noreply@sumanize.com>",
    to: email,
    subject: "Your Sumanize Email Verification Code",
    html: getOptimizedEmailTemplate(otp, expiryMinutes),
  });
}

async function storeOTPInKV(email, otp, expires, expiryMinutes) {
  const key = `otp:${email}`;
  const value = JSON.stringify({ otp, expires });
  const ttlSeconds = expiryMinutes * 60;

  await kv.setex(key, ttlSeconds, value);
}

function getOptimizedEmailTemplate(otp, expiryMinutes) {
  return `
    <div style="background:#1a1a1a;color:#e0e0e0;padding:48px 24px;border-radius:8px;max-width:580px;margin:20px auto;font-family:system-ui,-apple-system,sans-serif">
      <div style="text-align:center;margin-bottom:32px">
        <p style="color:#e0e0e0;font-size:18px;margin:0 0 8px">Hello from the Sumanize Team!</p>
        <p style="color:#a0a0a0;font-size:14px;margin:0">Please use the code below to verify your email address.</p>
      </div>
      
      <p style="color:#a0a0a0;text-align:center;margin:0 0 16px;font-size:16px">Your email verification code is:</p>
      
      <div style="background:#242424;border-radius:6px;padding:24px;text-align:center;margin:16px 0 32px">
        <span style="color:#fff;font-size:32px;letter-spacing:0.08em;font-family:monospace">${otp}</span>
      </div>
      
      <p style="color:#a0a0a0;text-align:center;margin:16px 0 0;font-size:14px;line-height:1.6">
        This code will expire in ${expiryMinutes} minutes.<br>
        If you did not request this, you can ignore this email.
      </p>
      
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #333;text-align:center">
        <small style="color:#777;font-size:12px">Sumanize Team</small>
      </div>
    </div>
  `;
}
