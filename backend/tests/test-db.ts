
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(
    process.env.MONGODB_URI as string,
    {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
    }
  );

  try {
    await connectionPromise;
    return mongoose;
  } catch (error) {
    try {
      await mongoose.disconnect();
    } catch {
      // Preserve the original connection error.
    }

    throw error;
  } finally {
    connectionPromise = null;
  }
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
