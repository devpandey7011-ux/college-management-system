import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateObjectId =
  (paramName: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid ${paramName}`,
      });
    }

    next();
  };