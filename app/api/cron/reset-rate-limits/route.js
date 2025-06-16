import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import User from "@/models/user";

export async function POST(request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secure-cron-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("Unauthorized cron job attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    console.log(`Starting rate limit reset at ${now.toISOString()}`);

    // Reset all users' message counts and update their reset times
    const result = await User.updateMany(
      {}, // Update all users
      {
        $set: {
          "usage.messagesToday": 0,
          "usage.lastMessageTime": null,
          "usage.dailyResetTime": getNext12HourReset(now),
        },
      },
    );

    console.log(
      `Rate limit reset completed. Updated ${result.modifiedCount} users`,
    );

    return NextResponse.json({
      success: true,
      message: `Reset rate limits for ${result.modifiedCount} users`,
      timestamp: now.toISOString(),
      nextReset: getNext12HourReset(now),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Helper function to get the next 12-hour reset time
function getNext12HourReset(currentTime = new Date()) {
  const next = new Date(currentTime);
  const currentHour = next.getHours();

  // Reset at 00:00 and 12:00 every day
  if (currentHour < 12) {
    // Next reset is at 12:00 today
    next.setHours(12, 0, 0, 0);
  } else {
    // Next reset is at 00:00 tomorrow
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }

  return next;
}

// Also allow GET for manual testing
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secure-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  return NextResponse.json({
    message: "Cron endpoint is working",
    currentTime: now.toISOString(),
    nextReset: getNext12HourReset(now),
  });
}
