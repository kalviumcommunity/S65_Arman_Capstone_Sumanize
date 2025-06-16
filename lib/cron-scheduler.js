import cron from "node-cron";

let isInitialized = false;

/**
 * Environment Variables Required:
 * - CRON_SECRET: Secret key for authenticating cron job requests
 * - ENABLE_CRON: Set to "true" to enable cron jobs in development (optional, auto-enabled in production)
 * - NEXTAUTH_URL: Base URL for the application (used for internal API calls)
 */

/**
 * Initialize cron jobs for the application
 */
export function initializeCronJobs() {
  if (isInitialized) {
    console.log("Cron jobs already initialized");
    return;
  }

  // Only run cron jobs in production or when explicitly enabled
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_CRON !== "true"
  ) {
    console.log(
      "Cron jobs disabled in development. Set ENABLE_CRON=true to enable.",
    );
    return;
  }

  console.log("Initializing cron jobs...");

  // Schedule rate limit reset every 12 hours at 00:00 and 12:00
  cron.schedule(
    "0 0,12 * * *",
    async () => {
      console.log("Running scheduled rate limit reset...");

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
          console.log("Rate limit reset successful:", result.message);
        } else {
          const error = await response.json();
          console.error("Rate limit reset failed:", error);
        }
      } catch (error) {
        console.error("Error executing rate limit reset cron job:", error);
      }
    },
    {
      timezone: "UTC", // Use UTC to avoid timezone issues
    },
  );

  // Schedule cleanup of unauthenticated users every hour
  cron.schedule(
    "0 * * * *",
    () => {
      console.log("Running hourly cleanup...");
      // This will be handled by the existing cleanup in rate-limiter.js
      // But we could add more cleanup logic here if needed
    },
    {
      timezone: "UTC",
    },
  );

  isInitialized = true;
  console.log("Cron jobs initialized successfully");
}

/**
 * Get the next 12-hour reset time for display purposes
 */
export function getNext12HourReset(currentTime = new Date()) {
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

/**
 * Get hours until next reset for display purposes
 */
export function getHoursUntilReset(currentTime = new Date()) {
  const nextReset = getNext12HourReset(currentTime);
  const hoursUntilReset = Math.ceil(
    (nextReset - currentTime) / (1000 * 60 * 60),
  );
  return Math.max(1, hoursUntilReset); // Ensure at least 1 hour is shown
}
