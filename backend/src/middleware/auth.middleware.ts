import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/User.model";
import mongoose from "mongoose";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}


export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.slice(7);
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret is not configured",
    });
  }

  let decoded: unknown;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded) ||
    typeof decoded.userId !== "string" ||
    !("type" in decoded) ||
    decoded.type !== "auth" ||
    !mongoose.isValidObjectId(decoded.userId)
  ) {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  try {
    const user = await User.findById(decoded.userId).select("_id role");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
