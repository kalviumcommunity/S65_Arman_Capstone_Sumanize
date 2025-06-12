// lib/database.js (The new, unified version)

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// Use a global variable to prevent multiple connections in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    listenersAttached: false,
  };
}

// Function to check connection state, replacing isDatabaseConnected()
export function isDbConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// Attach event listeners only once
function setupEventListeners() {
  if (cached.listenersAttached) {
    return;
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected. Attempting to reconnect...");
    // You could add reconnection logic here if needed, but Mongoose's driver often handles it.
  });

  cached.listenersAttached = true;
}

async function connectDB() {
  // If we have a cached connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise doesn't exist, create one
  if (!cached.promise) {
    setupEventListeners(); // Set up listeners before connecting

    const opts = {
      bufferCommands: false, // Recommended for modern Mongoose
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log("Creating new MongoDB connection...");
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connection promise resolved successfully.");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, nullify the promise so we can try again.
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
