import {  Response } from "express";
import Result from "../models/Result.model";
import Student from "../models/Student.model";
import Subject from "../models/Subject.model";
import Teacher from "../models/Teacher.model";
import SubjectAssignment from "../models/SubjectAssignment.model";
import { AuthRequest } from "../middleware/auth.middleware";
import Course from "../models/Course.model";

const calculateGrade = (
  marksObtained: number,
  maxMarks: number
): string => {
  const percentage = (marksObtained / maxMarks) * 100;

  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

export const createResult = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      student,
      subject,
      examType,
      marksObtained,
      maxMarks,
      remarks,
    } = req.body;

    if (
      !student ||
      !subject ||
      !examType ||
      marksObtained === undefined ||
      maxMarks === undefined
    ) {
      return res.status(400).json({
        message: "All required result fields are required",
      });
    }

    const teacher = await Teacher.findOne({
      user: req.user.id,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    const studentExists =
      await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const subjectExists =
      await Subject.findById(subject);

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Resolve the student's course code
    // to the Course document.
    const studentCourse =
      await Course.findOne({
        code: studentExists.course.toUpperCase(),
      });

    if (!studentCourse) {
      return res.status(404).json({
        message: "Student course not found",
      });
    }

    // Make sure the subject belongs to
    // the student's course.
    if (
      subjectExists.courseId.toString() !==
      studentCourse._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Subject does not belong to the student's course",
      });
    }

    // Make sure the subject belongs to
    // the student's semester.
    if (
      subjectExists.semester !==
      studentExists.semester
    ) {
      return res.status(403).json({
        message:
          "Subject does not belong to the student's semester",
      });
    }

    // Check whether this teacher is assigned
    // to the requested subject.
    const assignment =
      await SubjectAssignment.findOne({
        teacher: teacher._id,
        subject: subjectExists._id,
        course: studentCourse._id,
      });

    if (!assignment) {
      return res.status(403).json({
        message:
          "You are not assigned to this subject",
      });
    }

    // Validate marks.
    if (
      typeof marksObtained !== "number" ||
      typeof maxMarks !== "number" ||
      !Number.isFinite(marksObtained) ||
      !Number.isFinite(maxMarks) ||
      maxMarks <= 0
    ) {
      return res.status(400).json({
        message:
          "Marks and maximum marks must be valid numbers, and maximum marks must be greater than 0",
      });
    }

    if (
      marksObtained < 0 ||
      marksObtained > maxMarks
    ) {
      return res.status(400).json({
        message:
          "Marks obtained must be between 0 and maximum marks",
      });
    }

    // Validate exam type.
    if (
      ![
        "internal",
        "midterm",
        "final",
      ].includes(examType)
    ) {
      return res.status(400).json({
        message: "Invalid exam type",
      });
    }

    // Validate remarks if supplied.
    if (
      remarks !== undefined &&
      typeof remarks !== "string"
    ) {
      return res.status(400).json({
        message: "Remarks must be a string",
      });
    }

    const trimmedRemarks =
      typeof remarks === "string"
        ? remarks.trim()
        : undefined;

    if (
      trimmedRemarks !== undefined &&
      trimmedRemarks.length > 2000
    ) {
      return res.status(400).json({
        message:
          "Remarks cannot exceed 2000 characters",
      });
    }

    const grade = calculateGrade(
      marksObtained,
      maxMarks
    );

    // Prevent duplicate results.
    const existingResult =
      await Result.findOne({
        student: studentExists._id,
        subject: subjectExists._id,
        examType,
      });

    if (existingResult) {
      return res.status(409).json({
        message:
          "Result already exists for this student, subject and exam type",
      });
    }

    try {
      const result = await Result.create({
        student: studentExists._id,
        subject: subjectExists._id,
        teacher: teacher._id,
        examType,
        marksObtained,
        maxMarks,
        grade,
        remarks: trimmedRemarks,
      });

      return res.status(201).json({
        message: "Result uploaded successfully",
        result,
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        return res.status(409).json({
          message:
            "Result already exists for this student, subject and exam type",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Create result error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateResult = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result =
      await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    const teacher = await Teacher.findOne({
      user: req.user.id,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    // Only the teacher who created the result
    // can update it.
    if (
      result.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to update this result",
      });
    }

    const {
      marksObtained,
      maxMarks,
      remarks,
    } = req.body;

    // Validate supplied marks types.
    if (
      marksObtained !== undefined &&
      (
        typeof marksObtained !== "number" ||
        !Number.isFinite(marksObtained)
      )
    ) {
      return res.status(400).json({
        message:
          "Marks obtained must be a valid number",
      });
    }

    if (
      maxMarks !== undefined &&
      (
        typeof maxMarks !== "number" ||
        !Number.isFinite(maxMarks)
      )
    ) {
      return res.status(400).json({
        message:
          "Maximum marks must be a valid number",
      });
    }

    const finalMaxMarks =
      maxMarks !== undefined
        ? maxMarks
        : result.maxMarks;

    const finalMarks =
      marksObtained !== undefined
        ? marksObtained
        : result.marksObtained;

    if (
      typeof finalMarks !== "number" ||
      typeof finalMaxMarks !== "number" ||
      !Number.isFinite(finalMarks) ||
      !Number.isFinite(finalMaxMarks) ||
      finalMaxMarks <= 0
    ) {
      return res.status(400).json({
        message:
          "Marks and maximum marks must be valid numbers, and maximum marks must be greater than 0",
      });
    }

    if (
      finalMarks < 0 ||
      finalMarks > finalMaxMarks
    ) {
      return res.status(400).json({
        message:
          "Marks obtained must be between 0 and maximum marks",
      });
    }

    // Validate remarks if supplied.
    if (
      remarks !== undefined &&
      typeof remarks !== "string"
    ) {
      return res.status(400).json({
        message: "Remarks must be a string",
      });
    }

    const trimmedRemarks =
      typeof remarks === "string"
        ? remarks.trim()
        : undefined;

    if (
      trimmedRemarks !== undefined &&
      trimmedRemarks.length > 2000
    ) {
      return res.status(400).json({
        message:
          "Remarks cannot exceed 2000 characters",
      });
    }

    const finalGrade = calculateGrade(
      finalMarks,
      finalMaxMarks
    );

    if (marksObtained !== undefined) {
      result.marksObtained =
        finalMarks;
    }

    if (maxMarks !== undefined) {
      result.maxMarks =
        finalMaxMarks;
    }

    result.grade = finalGrade;

    if (remarks !== undefined) {
      result.remarks =
        trimmedRemarks;
    }

    await result.save();

    return res.status(200).json({
      message: "Result updated successfully",
      result,
    });
  } catch (error) {
    console.error("Update result error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getStudentResults = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const student =
      await Student.findOne({
        userId: req.user.id,
      }).select("_id");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const results =
      await Result.find({
        student: student._id,
      })
        .select(
          "student subject teacher examType marksObtained maxMarks grade remarks createdAt updatedAt"
        )
        .populate(
          "subject",
          "name code semester credits"
        )
        .populate(
          "teacher",
          "teacherId"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      results,
    });
  } catch (error) {
    console.error(
      "Get student results error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};
