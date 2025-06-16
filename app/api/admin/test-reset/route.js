import { NextResponse } from "next/server";

export async function POST(request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  try {
    const cronSecret = process.env.CRON_SECRET || "your-secure-cron-secret";

    // Make internal API call to reset rate limits
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cron/reset-rate-limits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: "Manual reset triggered successfully",
        details: result,
      });
    } else {
      const error = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: "Reset failed",
          details: error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Manual reset error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Manual reset endpoint is available",
    usage: "POST to this endpoint to trigger a manual reset",
    note: "Only available in development mode",
  });
}
