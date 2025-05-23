import { kv } from "@vercel/kv";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function quickSessionCheck(request) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return { valid: false, user: null };
    }

    // Verify JWT using jose
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload || !payload.email) {
      return { valid: false, user: null };
    }

    // Check if session exists in KV (super fast)
    const sessionKey = `session:${payload.id}`;
    const sessionExists = await kv.exists(sessionKey);

    if (!sessionExists) {
      return { valid: false, user: null };
    }

    // Extend session
    await kv.expire(sessionKey, 7 * 24 * 60 * 60);

    return {
      valid: true,
      user: {
        id: payload.id,
        email: payload.email,
      },
    };
  } catch (error) {
    return { valid: false, user: null };
  }
}

function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies["sumanize-token"];
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}
