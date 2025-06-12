import { validateEnvironment, initializeAI } from "./config.js";
import connectDB from "../lib/database.js";
import { createWebSocketServer, setupGracefulShutdown } from "./server.js";

const startWebSocketServer = async () => {
  try {
    validateEnvironment();
    const model = initializeAI();

    console.log("Connecting to MongoDB via unified connector...");
    await connectDB();

    const { wss, heartbeatInterval } = createWebSocketServer(model);
    setupGracefulShutdown(wss, heartbeatInterval);

    console.log("WebSocket server fully initialized and ready for connections");
  } catch (error) {
    console.error("Failed to start WebSocket server:", error);
    process.exit(1);
  }
};

startWebSocketServer();
