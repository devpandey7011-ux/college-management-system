import { Response } from "express";
import Attendance from "../models/Attendance.model";
import Student from "../models/Student.model";
import Subject from "../models/Subject.model";
import Teacher from "../models/Teacher.model";
import Course from "../models/Course.model";
import SubjectAssignment from "../models/SubjectAssignment.model";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";


export const createAttendance = async (
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
      date,
      status,
      remarks,
    } = req.body || {};

    if (
      !student ||
      !subject ||
      !date ||
      !status
    ) {
      return res.status(400).json({
        message:
          "Student, subject, date and status are required",
      });
    }

    // Validate student and subject IDs.
    if (
      typeof student !== "string" ||
      !mongoose.isValidObjectId(student) ||
      typeof subject !== "string" ||
      !mongoose.isValidObjectId(subject)
    ) {
      return res.status(400).json({
        message: "Invalid student or subject ID",
      });
    }

    const studentObjectId =
      new mongoose.Types.ObjectId(student);

    const subjectObjectId =
      new mongoose.Types.ObjectId(subject);

    const teacherObjectId =
      new mongoose.Types.ObjectId(
        String(req.user.id)
      );

    if (typeof date !== "string") {
      return res.status(400).json({
        message: "Date must be a valid date string",
      });
    }

    const attendanceDate = new Date(date);

    if (
      Number.isNaN(
        attendanceDate.getTime()
      )
    ) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    if (
      ![
        "present",
        "absent",
        "late",
      ].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid attendance status",
      });
    }

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

    const teacher =
      await Teacher.findOne({
        user: teacherObjectId,
      });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    const studentExists =
      await Student.findById(
        studentObjectId
      );

    if (!studentExists) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const subjectExists =
      await Subject.findById(
        subjectObjectId
      );

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
        message:
          "Student course not found",
      });
    }

    // Make sure the subject belongs
    // to the student's course.
    if (
      subjectExists.courseId.toString() !==
      studentCourse._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Subject does not belong to the student's course",
      });
    }

    // Make sure the subject belongs
    // to the student's semester.
    if (
      subjectExists.semester !==
      studentExists.semester
    ) {
      return res.status(403).json({
        message:
          "Subject does not belong to the student's semester",
      });
    }

    // Make sure this teacher is assigned
    // to this exact subject and course.
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

    // Prevent duplicate attendance.
    const existingAttendance =
      await Attendance.findOne({
        student: studentExists._id,
        subject: subjectExists._id,
        date: attendanceDate,
      });

    if (existingAttendance) {
      return res.status(409).json({
        message:
          "Attendance already exists for this student, subject and date",
      });
    }

    try {
      const attendance =
        await Attendance.create({
          student: studentExists._id,
          subject: subjectExists._id,
          teacher: teacher._id,
          date: attendanceDate,
          status,
          remarks: trimmedRemarks,
        });

      return res.status(201).json({
        message:
          "Attendance recorded successfully",
        attendance,
      });
    } catch (error: unknown) {
      // Handle a race where another request
      // creates the same attendance record
      // after our duplicate check.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code ===
          11000
      ) {
        return res.status(409).json({
          message:
            "Attendance already exists for this student, subject and date",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error(
      "Create attendance error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};



export const updateAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Validate attendance ID before querying.
    const attendanceId = String(req.params.id);

    if (!mongoose.isValidObjectId(attendanceId)) {
      return res.status(400).json({
        message: "Invalid attendance ID",
      });
    }

    const attendanceObjectId =
      new mongoose.Types.ObjectId(attendanceId);

    const attendance =
      await Attendance.findById(
        attendanceObjectId
      );

    if (!attendance) {
      return res.status(404).json({
        message:
          "Attendance record not found",
      });
    }

    const teacherObjectId =
      new mongoose.Types.ObjectId(
        String(req.user.id)
      );

    const teacher =
      await Teacher.findOne({
        user: teacherObjectId,
      });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    // Only the teacher who created the
    // attendance record can update it.
    if (
      attendance.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to update this attendance",
      });
    }

    const {
      status,
      remarks,
    } = req.body || {};

    if (status !== undefined) {
      if (
        ![
          "present",
          "absent",
          "late",
        ].includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid attendance status",
        });
      }

      attendance.status = status;
    }

    if (
      remarks !== undefined &&
      typeof remarks !== "string"
    ) {
      return res.status(400).json({
        message: "Remarks must be a string",
      });
    }

    if (remarks !== undefined) {
      const trimmedRemarks =
        remarks.trim();

      if (
        trimmedRemarks.length > 2000
      ) {
        return res.status(400).json({
          message:
            "Remarks cannot exceed 2000 characters",
        });
      }

      attendance.remarks =
        trimmedRemarks;
    }

    await attendance.save();

    return res.status(200).json({
      message:
        "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error(
      "Update attendance error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getStudentAttendance = async (
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
        message:
          "Student profile not found",
      });
    }

    const attendance =
      await Attendance.find({
        student: student._id,
      })
        .select(
          "student subject teacher date status remarks createdAt updatedAt"
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
          date: -1,
        })
        .lean();

    return res.status(200).json({
      attendance,
    });
  } catch (error) {
    console.error(
      "Get student attendance error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getStudentAttendanceSummary = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

      const student =
        await Student.findOne({
          userId: req.user.id,
        }).select("_id");

      if (!student) {
        return res.status(404).json({
          message:
            "Student profile not found",
        });
      }

      /*
       * Calculate attendance statistics
       * directly in MongoDB instead of loading
       * every attendance record into Node.js.
       */
      const summary =
        await Attendance.aggregate([
          {
            $match: {
              student: student._id,
            },
          },
          {
            $group: {
              _id: "$subject",
              present: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "present",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              absent: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "absent",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              late: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "late",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              total: {
                $sum: 1,
              },
            },
          },
          {
            $lookup: {
              from: "subjects",
              localField: "_id",
              foreignField: "_id",
              as: "subject",
            },
          },
          {
            $unwind: "$subject",
          },
          {
            $project: {
              _id: 0,
              subjectId: "$_id",
              subjectName:
                "$subject.name",
              subjectCode:
                "$subject.code",
              present: 1,
              absent: 1,
              late: 1,
              total: 1,
            },
          },
          {
            $sort: {
              subjectName: 1,
            },
          },
        ]);

      const formattedSummary =
        summary.map((item) => ({
          ...item,
          attendancePercentage:
            item.total === 0
              ? 0
              : Number(
                  (
                    (item.present /
                      item.total) *
                    100
                  ).toFixed(2)
                ),
        }));

      return res.status(200).json({
        summary: formattedSummary,
      });
    } catch (error) {
      console.error(
        "Get attendance summary error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  };
