import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

// Global cache (VERY IMPORTANT for Vercel)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false, 
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
