import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
