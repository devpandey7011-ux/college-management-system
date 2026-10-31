
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const notFoundHandler = (
  _req: Request,
  res: Response
) => {
  return res.status(404).json({
    message: "Route not found",
  });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Invalid MongoDB ObjectId
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Invalid resource ID",
    });
  }

  // MongoDB duplicate key
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return res.status(409).json({
      message: "A record with this value already exists",
    });
  }

  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Database validation failed",
    });
  }

  // Log internal details on the server, not in the response.
  console.error("Unhandled application error:", error);

  return res.status(500).json({
    message: "Internal server error",
  });
};
