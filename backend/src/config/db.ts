
import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected successfully");
};

export default connectDB;
