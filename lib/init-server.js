import { initializeCronJobs } from "@/lib/cron-scheduler";

// Initialize cron jobs on server startup
initializeCronJobs();

export default function initServer() {
  // This function is called to ensure the module is loaded
  console.log("Server initialization complete");
}
