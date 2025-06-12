import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import { isDbConnected } from "../lib/database.js";
import {
  heartbeat,
  cleanupConnection,
  setupHeartbeat,
} from "./connection-manager.js";
import { handleMessage } from "./message-handler.js";

const createWebSocketServer = (model) => {
  const wss = new WebSocketServer({
    port: 3001,
    perMessageDeflate: false,
    clientTracking: true,
    maxPayload: 16 * 1024 * 1024,
  });

  console.log("WebSocket server started on port 3001");

  const heartbeatInterval = setupHeartbeat(wss);

  wss.on("connection", async (ws, request) => {
    let chatId, userId;

    try {
      ws.isAlive = true;
      ws.lastPing = Date.now();
      ws.connectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const url = new URL(request.url, `http://${request.headers.host}`);
      chatId = url.searchParams.get("chatId");
      userId = url.searchParams.get("userId");

      if (!chatId || !userId || chatId.length < 5 || userId.length < 5) {
        console.log(
          `WebSocket connection rejected: Invalid parameters (chatId: ${chatId}, userId: ${userId})`,
        );
        cleanupConnection(ws, "Invalid parameters");
        return;
      }

      if (!isDbConnected()) {
        console.log("WebSocket connection rejected: Database not connected");
        cleanupConnection(ws, "Database unavailable");
        return;
      }

      console.log(
        `WebSocket connected: ${ws.connectionId} (user: ${userId}, chat: ${chatId})`,
      );

      ws.on("pong", () => heartbeat(ws));

      ws.on("error", (error) => {
        console.error(`WebSocket error for ${ws.connectionId}:`, error);
      });

      ws.on("close", (code, reason) => {
        console.log(
          `🔌 WebSocket disconnected: ${ws.connectionId} (code: ${code}, reason: ${reason || "none"})`,
        );
      });

      ws.on("message", async (data) => {
        await handleMessage(ws, data, model, chatId, userId);
      });
    } catch (connectionError) {
      console.error("Connection setup error:", connectionError);
      cleanupConnection(ws, "Setup failed");
    }
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });

  wss.on("close", () => {
    console.log("WebSocket server closed");
    clearInterval(heartbeatInterval);
  });

  return { wss, heartbeatInterval };
};

const setupGracefulShutdown = (wss, heartbeatInterval) => {
  const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}, initiating graceful shutdown...`);

    wss.close((error) => {
      if (error) {
        console.error("Error closing WebSocket server:", error);
      } else {
        console.log("WebSocket server closed gracefully");
      }
    });

    wss.clients.forEach((ws) => {
      try {
        cleanupConnection(ws, "Server shutdown");
      } catch (error) {
        console.error("Error closing client connection:", error);
      }
    });

    clearInterval(heartbeatInterval);

    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB:", error);
    }

    console.log("Graceful shutdown completed");
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2"));

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    gracefulShutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("UNHANDLED_REJECTION");
  });
};

export { createWebSocketServer, setupGracefulShutdown };
