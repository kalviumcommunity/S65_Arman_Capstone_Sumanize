import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserUsage } from "@/lib/rate-limiter";

export async function GET() {
  try {
    const session = await auth();

    const usage = await getUserUsage(session);

    if (!usage) {
      return NextResponse.json(
        { error: "Failed to get usage information" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      usage,
      isAuthenticated: !!session?.user?.id,
    });
  } catch (error) {
    console.error("Error getting user usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
