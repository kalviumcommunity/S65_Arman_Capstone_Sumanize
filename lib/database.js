import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
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

// The MongoDBAdapter needs a promise that resolves to the MongoClient.
// We're getting it from the Mongoose connection to ensure we're using the same connection pool.
// Caching the promise in dev to avoid re-creating it on every hot-reload.
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
