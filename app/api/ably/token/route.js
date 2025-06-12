import Ably from "ably";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize Ably with the ROOT API key (server-side only)
    const client = new Ably.Rest(process.env.ABLY_API_KEY);

    // Create a token request with user-specific capabilities
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: session.user.id,
      capability: {
        [`chat:${session.user.id}:*`]: ["publish", "subscribe", "presence"],
        [`ai-responses:${session.user.id}:*`]: ["subscribe"],
        [`ai-status:${session.user.id}:*`]: ["subscribe"],
      },
      ttl: 3600000, // 1 hour
    });

    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Ably token creation error:", error);
    return NextResponse.json(
      { error: "Failed to create Ably token" },
      { status: 500 },
    );
  }
}
