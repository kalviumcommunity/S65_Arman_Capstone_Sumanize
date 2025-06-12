import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

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
  });

  cached.listenersAttached = true;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongooseClientPromise) {
    global._mongooseClientPromise = connectDB().then((mongooseInstance) =>
      mongooseInstance.connection.getClient(),
    );
  }
  clientPromise = global._mongooseClientPromise;
} else {
  clientPromise = connectDB().then((mongooseInstance) =>
    mongooseInstance.connection.getClient(),
  );
}

export { clientPromise };
export default connectDB;
