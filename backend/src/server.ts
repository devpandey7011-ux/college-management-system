
import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import { validateEnv } from "./config/env";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();

    await connectDB();

    app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();



