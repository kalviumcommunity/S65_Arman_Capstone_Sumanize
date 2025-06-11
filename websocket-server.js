import { WebSocketServer } from "ws";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import User from "./models/user.js";

dotenv.config({ path: ".env.local" });

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY is missing from environment variables");
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("FATAL: MONGODB_URI is missing from environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Enhanced MongoDB connection with retry logic
let isDBConnected = false;
const connectToMongoDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1
      });
      console.log("✅ Connected to MongoDB successfully");
      isDBConnected = true;
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error("FATAL: Failed to connect to MongoDB after all retries");
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
    }
  }
};

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB connected');
  isDBConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
  isDBConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
  isDBConnected = false;
});

// Initialize MongoDB connection
await connectToMongoDB();

const wss = new WebSocketServer({ 
  port: 3001,
  perMessageDeflate: false,
  clientTracking: true,
  maxPayload: 16 * 1024 * 1024 // 16MB max payload
});

console.log("🚀 WebSocket server started on port 3001");

// Enhanced heartbeat function
const heartbeat = (ws) => {
  ws.isAlive = true;
  ws.lastPing = Date.now();
};

// Connection cleanup utility
const cleanupConnection = (ws, reason = "unknown") => {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.close(1000, reason);
    }
  } catch (error) {
    console.error("Error during connection cleanup:", error);
  }
};

// Safe message send utility
const safeSend = (ws, data) => {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

wss.on("connection", async (ws, request) => {
  let chatId, userId;
  
  try {
    // Initialize connection state
    ws.isAlive = true;
    ws.lastPing = Date.now();
    ws.connectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Parse query parameters with validation
    const url = new URL(request.url, `http://${request.headers.host}`);
    chatId = url.searchParams.get("chatId");
    userId = url.searchParams.get("userId");

    // Validate required parameters
    if (!chatId || !userId || chatId.length < 5 || userId.length < 5) {
      console.log(`❌ WebSocket connection rejected: Invalid parameters (chatId: ${chatId}, userId: ${userId})`);
      cleanupConnection(ws, "Invalid parameters");
      return;
    }

    // Check database connection
    if (!isDBConnected) {
      console.log("❌ WebSocket connection rejected: Database not connected");
      cleanupConnection(ws, "Database unavailable");
      return;
    }

    console.log(`✅ WebSocket connected: ${ws.connectionId} (user: ${userId}, chat: ${chatId})`);

    // Set up connection event handlers
    ws.on("pong", () => heartbeat(ws));
    
    ws.on("error", (error) => {
      console.error(`❌ WebSocket error for ${ws.connectionId}:`, error);
    });

    ws.on("close", (code, reason) => {
      console.log(`🔌 WebSocket disconnected: ${ws.connectionId} (code: ${code}, reason: ${reason || 'none'})`);
    });

    // Message handler with comprehensive error handling
    ws.on("message", async (data) => {
      try {
        // Validate connection state
        if (!isDBConnected) {
          safeSend(ws, { error: "Database connection lost" });
          return;
        }

        // Parse and validate message
        let message;
        try {
          message = JSON.parse(data.toString());
        } catch (parseError) {
          console.error("Invalid JSON received:", parseError);
          safeSend(ws, { error: "Invalid message format" });
          return;
        }
        
        if (message.type !== "message" || !message.content || typeof message.content !== 'string') {
          safeSend(ws, { error: "Invalid message structure" });
          return;
        }

        // Verify user has access to this chat with timeout
        const chatPromise = Chat.findOne({ chatId, userId }).lean().maxTimeMS(5000);
        const chat = await Promise.race([
          chatPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), 6000))
        ]);

        if (!chat) {
          safeSend(ws, { error: "Chat not found or access denied" });
          return;
        }

        console.log(`📨 Processing message for chat ${chatId} (${chat.messages?.length || 0} previous messages)`);

        // Prepare conversation history with safety checks
        const conversationHistory = [];
        if (chat.messages && Array.isArray(chat.messages)) {
          for (const msg of chat.messages.slice(-20)) { // Limit to last 20 messages for context
            if (msg.role && msg.content && typeof msg.content === 'string') {
              conversationHistory.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content.substring(0, 8000) }] // Limit message length
              });
            }
          }
        }

        // Generate AI response with enhanced error handling and timeouts
        let chatSession;
        try {
          chatSession = model.startChat({
            history: conversationHistory,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096, // Reduced for stability
              candidateCount: 1,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          });
        } catch (modelError) {
          console.error("Failed to create chat session:", modelError);
          safeSend(ws, { error: "Failed to initialize AI chat session" });
          return;
        }

        const messageContent = message.content.substring(0, 4000); // Limit input length
        let fullResponse = "";
        let chunkCount = 0;
        
        try {
          // Set up response timeout
          const responseTimeout = setTimeout(() => {
            console.error("AI response timeout for chat", chatId);
            safeSend(ws, { error: "Response timeout" });
            cleanupConnection(ws, "Response timeout");
          }, 45000); // 45 second timeout

          const result = await chatSession.sendMessageStream(messageContent);
          
          // Stream the response with enhanced error handling
          for await (const chunk of result.stream) {
            // Check connection health
            if (ws.readyState !== ws.OPEN) {
              clearTimeout(responseTimeout);
              console.log("Connection closed during streaming");
              return;
            }

            const chunkText = chunk.text();
            if (chunkText && chunkText.length > 0) {
              fullResponse += chunkText;
              chunkCount++;
              
              // Send chunk with connection check
              const sent = safeSend(ws, {
                type: "chunk",
                text: chunkText,
                chunkIndex: chunkCount
              });
              
              if (!sent) {
                clearTimeout(responseTimeout);
                console.log("Failed to send chunk, connection likely closed");
                return;
              }
            }
          }
          
          clearTimeout(responseTimeout);

          // Validate complete response
          if (!fullResponse || fullResponse.length === 0) {
            safeSend(ws, { error: "Empty response generated" });
            return;
          }

          // Send completion signal
          safeSend(ws, {
            type: "complete",
            content: fullResponse,
            totalChunks: chunkCount
          });
          
          console.log(`✅ Response completed for chat ${chatId} (${chunkCount} chunks, ${fullResponse.length} chars)`);

        } catch (streamError) {
          console.error("Streaming error:", streamError);
          safeSend(ws, { 
            error: "Failed to generate response",
            details: streamError.message || "Unknown streaming error"
          });
        }

      } catch (error) {
        console.error(`❌ Message processing error for ${ws.connectionId}:`, error);
        safeSend(ws, { 
          error: "Internal server error",
          details: error.message || "Unknown error"
        });
      }
    });

  } catch (connectionError) {
    console.error("❌ Connection setup error:", connectionError);
    cleanupConnection(ws, "Setup failed");
  }
});

// Enhanced ping/pong heartbeat with dead connection cleanup
const heartbeatInterval = setInterval(() => {
  const now = Date.now();
  wss.clients.forEach((ws) => {
    try {
      // Check if connection is stale (no pong for over 60 seconds)
      if (ws.lastPing && (now - ws.lastPing) > 60000) {
        console.log(`🔌 Terminating stale connection: ${ws.connectionId || 'unknown'}`);
        ws.terminate();
        return;
      }

      if (ws.isAlive === false) {
        console.log(`🔌 Terminating dead connection: ${ws.connectionId || 'unknown'}`);
        ws.terminate();
        return;
      }
      
      ws.isAlive = false;
      ws.ping((error) => {
        if (error) {
          console.error(`Ping error for ${ws.connectionId}:`, error);
        }
      });
    } catch (error) {
      console.error("Heartbeat error:", error);
      try {
        ws.terminate();
      } catch (termError) {
        console.error("Error terminating connection:", termError);
      }
    }
  });
}, 30000);

// Enhanced server event handlers
wss.on("error", (error) => {
  console.error("❌ WebSocket server error:", error);
});

wss.on("close", () => {
  console.log("🔌 WebSocket server closed");
  clearInterval(heartbeatInterval);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
  
  // Stop accepting new connections
  wss.close((error) => {
    if (error) {
      console.error("Error closing WebSocket server:", error);
    } else {
      console.log("✅ WebSocket server closed gracefully");
    }
  });
  
  // Close all existing connections
  wss.clients.forEach((ws) => {
    try {
      cleanupConnection(ws, "Server shutdown");
    } catch (error) {
      console.error("Error closing client connection:", error);
    }
  });
  
  // Clear intervals
  clearInterval(heartbeatInterval);
  
  // Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error closing MongoDB:", error);
  }
  
  console.log("✅ Graceful shutdown completed");
  process.exit(0);
};

// Handle various shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // For nodemon

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

console.log("🎯 WebSocket server fully initialized and ready for connections"); 