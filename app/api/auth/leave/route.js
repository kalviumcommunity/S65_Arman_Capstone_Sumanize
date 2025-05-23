import { kv } from "@vercel/kv";
import { jwtVerify } from "jose";

export const runtime = "edge";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        
        if (payload && payload.id) {
          await kv.del(`session:${payload.id}`);
        }
      } catch (error) {
        console.log("Invalid token during logout:", error.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error during logout:", error);
    return Response.json({ success: true });
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
