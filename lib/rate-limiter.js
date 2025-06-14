import connectDB from "@/lib/database";
import User, { RateLimits } from "@/models/user";
import crypto from "crypto";

/**
 * Generate a browser fingerprint for unauthenticated users.
 * Uses IP, User-Agent, and other headers for basic fingerprinting.
 */
function generateFingerprint(request) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const acceptLanguage = request.headers.get("accept-language") || "unknown";
  const acceptEncoding = request.headers.get("accept-encoding") || "unknown";

  const fingerprint = `${ip}-${userAgent}-${acceptLanguage}-${acceptEncoding}`;

  return crypto
    .createHash("sha256")
    .update(fingerprint)
    .digest("hex")
    .substring(0, 20);
}

/**
 * Rate limiting for unauthenticated users using an in-memory store.
 * In production, you should use Redis or a similar persistent store.
 */
const unauthenticatedUsage = new Map();

// Maximum number of unauthenticated users to track to prevent memory exhaustion.
const MAX_UNAUTHENTICATED_USERS = 10000;

/**
 * Clean up old unauthenticated usage records.
 */
function cleanupUnauthenticatedUsage() {
  const now = new Date();
  for (const [fingerprint, data] of unauthenticatedUsage.entries()) {
    if (now > data.resetTime) {
      unauthenticatedUsage.delete(fingerprint);
    }
  }
}

/**
 * Check and enforce rate limits for authenticated users using atomic
 * database operations to prevent race conditions.
 */
async function checkAuthenticatedUserLimits(userId) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await user.resetUsageIfNeeded();

  const limits = user.getRateLimits();

  if (user.usage.messagesToday >= limits.messagesPerDay) {
    const resetTime = user.usage.dailyResetTime;
    const hoursUntilReset = Math.ceil(
      (resetTime - new Date()) / (1000 * 60 * 60),
    );

    return {
      allowed: false,
      error: `Daily message limit exceeded (${limits.messagesPerDay} messages). Resets in ${hoursUntilReset} hours.`,
      resetTime: resetTime,
      usage: {
        used: user.usage.messagesToday,
        limit: limits.messagesPerDay,
        tier: user.tier,
      },
    };
  }

  // Use an atomic increment to prevent race conditions.
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { "usage.messagesToday": 1 },
      $set: { "usage.lastMessageTime": new Date() },
    },
    { new: true },
  );

  if (!updatedUser) {
    throw new Error("Failed to update user usage");
  }

  return {
    allowed: true,
    usage: {
      used: updatedUser.usage.messagesToday,
      limit: limits.messagesPerDay,
      tier: updatedUser.tier,
      remaining: limits.messagesPerDay - updatedUser.usage.messagesToday,
    },
  };
}

/**
 * Check and enforce rate limits for unauthenticated users.
 */
function checkUnauthenticatedUserLimits(request) {
  const fingerprint = generateFingerprint(request);
  const now = new Date();
  const limits = RateLimits.UNAUTHENTICATED;

  // Clean up old records periodically to manage memory.
  if (Math.random() < 0.1) {
    // 10% chance to cleanup
    cleanupUnauthenticatedUsage();
  }

  let usage = unauthenticatedUsage.get(fingerprint);
  if (!usage || now > usage.resetTime) {
    // Prevent memory exhaustion by limiting the number of tracked users.
    if (unauthenticatedUsage.size >= MAX_UNAUTHENTICATED_USERS) {
      const entries = Array.from(unauthenticatedUsage.entries());
      entries.sort((a, b) => a[1].resetTime - b[1].resetTime);

      // Remove the oldest 20% of entries.
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        unauthenticatedUsage.delete(entries[i][0]);
      }
    }

    const resetTime = new Date(now);
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);

    usage = {
      messagesToday: 0,
      resetTime: resetTime,
    };
    unauthenticatedUsage.set(fingerprint, usage);
  }

  if (usage.messagesToday >= limits.messagesPerDay) {
    const hoursUntilReset = Math.ceil(
      (usage.resetTime - now) / (1000 * 60 * 60),
    );

    return {
      allowed: false,
      error: `Daily message limit exceeded for unauthenticated users (${limits.messagesPerDay} messages). Please sign in for higher limits or wait ${hoursUntilReset} hours.`,
      resetTime: usage.resetTime,
      usage: {
        used: usage.messagesToday,
        limit: limits.messagesPerDay,
        tier: "unauthenticated",
      },
    };
  }

  usage.messagesToday += 1;
  unauthenticatedUsage.set(fingerprint, usage);

  return {
    allowed: true,
    usage: {
      used: usage.messagesToday,
      limit: limits.messagesPerDay,
      tier: "unauthenticated",
      remaining: limits.messagesPerDay - usage.messagesToday,
    },
  };
}

/**
 * Main rate limiting function that handles both authenticated and
 * unauthenticated users.
 */
export async function checkRateLimit(request, session) {
  try {
    if (session?.user?.id) {
      // Additional validation to prevent session manipulation.
      if (typeof session.user.id !== "string" || session.user.id.length < 10) {
        console.warn("Invalid user ID format in session:", session.user.id);
        return {
          allowed: false,
          error: "Invalid session",
          usage: { used: 0, limit: 0, tier: "invalid" },
        };
      }
      // Authenticated user
      return await checkAuthenticatedUserLimits(session.user.id);
    } else {
      // Unauthenticated user
      return checkUnauthenticatedUserLimits(request);
    }
  } catch (error) {
    console.error("Rate limiting error:", error);

    // In case of error, be more restrictive for security.
    if (
      error.message.includes("User not found") ||
      error.message.includes("Failed to update")
    ) {
      return {
        allowed: false,
        error: "Rate limiting service unavailable. Please try again.",
        usage: { used: 0, limit: 0, tier: "error" },
      };
    }

    // For other errors, allow but log extensively as a critical failure.
    console.error("CRITICAL: Rate limiting bypass due to error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      allowed: true,
      error: "Rate limiting temporarily unavailable",
      usage: { used: 0, limit: 1, tier: "unknown" },
    };
  }
}

/**
 * Get current usage for a user, typically for displaying in the UI.
 */
export async function getUserUsage(session) {
  if (!session?.user?.id) {
    return {
      used: 0,
      limit: RateLimits.UNAUTHENTICATED.messagesPerDay,
      tier: "unauthenticated",
    };
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return null;

    await user.resetUsageIfNeeded();
    const limits = user.getRateLimits();

    return {
      used: user.usage.messagesToday,
      limit: limits.messagesPerDay,
      tier: user.tier,
      remaining: limits.messagesPerDay - user.usage.messagesToday,
      resetTime: user.usage.dailyResetTime,
    };
  } catch (error) {
    console.error("Error getting user usage:", error);
    return null;
  }
}