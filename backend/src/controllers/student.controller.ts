import { Response } from "express";
import Student from "../models/Student.model";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";

export const getStudentProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const userObjectId = new mongoose.Types.ObjectId(
      String(req.user.id)
    );

    const student = await Student.findOne({
     userId: userObjectId,
    }).populate("userId", "name email role");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      student,
    });
  } catch (error) {
    console.error("Get student profile error:", error);

    return res.status(500).json({
      message: "Failed to get student profile",
    });
  }
};
export const updateStudentProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const userObjectId = new mongoose.Types.ObjectId(
      String(req.user.id)
    );

   const { phone, dateOfBirth } = req.body;

const updateData: {
  phone?: string;
  dateOfBirth?: string;
} = {};

if (phone !== undefined) {
  updateData.phone = phone;
}

if (dateOfBirth !== undefined) {
  updateData.dateOfBirth = dateOfBirth;
}

const student = await Student.findOneAndUpdate(
  { userId: userObjectId },
  updateData,
      {
       returnDocument: "after",
        runValidators: true,
      }
    ).populate("userId", "name email role");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update student profile error:", error);

    return res.status(500).json({
      message: "Failed to update student profile",
    });
  }
};