import { Request, Response } from "express";
import mongoose from "mongoose";

import Subject from "../models/Subject.model";
import Course from "../models/Course.model";
import Student from "../models/Student.model";
import SubjectAssignment from "../models/SubjectAssignment.model";
import Assignment from "../models/Assignment.model";
import Result from "../models/Result.model";
import Attendance from "../models/Attendance.model";

import { AuthRequest } from "../middleware/auth.middleware";

const normalizeText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const normalizeCode = (value: unknown): string => {
  return normalizeText(value).toUpperCase();
};

const isValidSemester = (value: unknown): value is number => {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 12
  );
};

const isValidCredits = (value: unknown): value is number => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 10
  );
};

const isValidObjectId = (value: unknown): boolean => {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
};

export const createSubject = async (
  req: Request,
  res: Response
) => {
  try {
    const name = normalizeText(req.body.name);
    const code = normalizeCode(req.body.code);
    const courseId = req.body.courseId;
    const semester = req.body.semester;
    const credits = req.body.credits;

    if (
      !name ||
      !code ||
      !courseId ||
      semester === undefined ||
      credits === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, code, courseId, semester and credits are required",
      });
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    if (!isValidSemester(semester)) {
      return res.status(400).json({
        message:
          "Semester must be an integer between 1 and 12",
      });
    }

    if (!isValidCredits(credits)) {
      return res.status(400).json({
        message:
          "Credits must be a number between 1 and 10",
      });
    }

    const courseExists = await Course.findById(courseId);

    if (!courseExists) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (semester > courseExists.totalSemesters) {
      return res.status(400).json({
        message:
          `Semester must be between 1 and ${courseExists.totalSemesters} for this course`,
      });
    }

    const existingSubject = await Subject.findOne({
      code,
    });

    if (existingSubject) {
      return res.status(409).json({
        message:
          "Subject with this code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code,
      courseId: courseExists._id,
      semester,
      credits,
    });

    const populatedSubject = await Subject.findById(
      subject._id
    ).populate("courseId", "name code");

    return res.status(201).json({
      message: "Subject created successfully",
      subject: populatedSubject,
    });
  } catch (error) {
    console.error("Create subject error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSubjects = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Students only see subjects for their own
    // course and current semester.
    if (req.user.role === "student") {
      const student = await Student.findOne({
        userId: req.user.id,
      });

      if (!student) {
        return res.status(404).json({
          message: "Student profile not found",
        });
      }

      const course = await Course.findOne({
        code: student.course.toUpperCase(),
      });

      if (!course) {
        return res.status(404).json({
          message: "Student course not found",
        });
      }

      const subjects = await Subject.find({
        courseId: course._id,
        semester: student.semester,
      })
        .populate("courseId", "name code")
        .sort({
          name: 1,
        });

      return res.status(200).json({
        subjects,
      });
    }

    // Admins and teachers can see all subjects.
    const subjects = await Subject.find()
      .populate("courseId", "name code")
      .sort({
        semester: 1,
        name: 1,
      });

    return res.status(200).json({
      subjects,
    });
  } catch (error) {
    console.error("Get subjects error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSubjectById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    const subject = await Subject.findById(
      req.params.id
    ).populate("courseId", "name code");

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Students must not be able to retrieve an arbitrary
    // subject belonging to another course/semester.
    if (req.user.role === "student") {
      const student = await Student.findOne({
        userId: req.user.id,
      });

      if (!student) {
        return res.status(404).json({
          message: "Student profile not found",
        });
      }

      const course = await Course.findOne({
        code: student.course.toUpperCase(),
      });

      if (!course) {
        return res.status(404).json({
          message: "Student course not found",
        });
      }

      if (
        subject.courseId._id.toString() !==
          course._id.toString() ||
        subject.semester !== student.semester
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to view this subject",
        });
      }
    }

    return res.status(200).json({
      subject,
    });
  } catch (error) {
    console.error("Get subject error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateSubject = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    const subject = await Subject.findById(
      req.params.id
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const name =
      req.body.name !== undefined
        ? normalizeText(req.body.name)
        : undefined;

    const code =
      req.body.code !== undefined
        ? normalizeCode(req.body.code)
        : undefined;

    const courseId =
      req.body.courseId !== undefined
        ? req.body.courseId
        : undefined;

    const semester =
      req.body.semester !== undefined
        ? req.body.semester
        : undefined;

    const credits =
      req.body.credits !== undefined
        ? req.body.credits
        : undefined;

    if (
      name !== undefined &&
      !name
    ) {
      return res.status(400).json({
        message: "Subject name cannot be empty",
      });
    }

    if (
      code !== undefined &&
      !code
    ) {
      return res.status(400).json({
        message: "Subject code cannot be empty",
      });
    }

    if (
      semester !== undefined &&
      !isValidSemester(semester)
    ) {
      return res.status(400).json({
        message:
          "Semester must be an integer between 1 and 12",
      });
    }

    if (
      credits !== undefined &&
      !isValidCredits(credits)
    ) {
      return res.status(400).json({
        message:
          "Credits must be a number between 1 and 10",
      });
    }

    if (
      courseId !== undefined &&
      !isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    let targetCourse = await Course.findById(
      subject.courseId
    );

    if (!targetCourse) {
      return res.status(404).json({
        message: "Current subject course not found",
      });
    }

    if (courseId !== undefined) {
      const courseExists = await Course.findById(
        courseId
      );

      if (!courseExists) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      targetCourse = courseExists;
    }

    const finalSemester =
      semester !== undefined
        ? semester
        : subject.semester;

    if (
      finalSemester >
      targetCourse.totalSemesters
    ) {
      return res.status(400).json({
        message:
          `Semester must be between 1 and ${targetCourse.totalSemesters} for this course`,
      });
    }

    if (
      code !== undefined &&
      code !== subject.code
    ) {
      const duplicateSubject =
        await Subject.findOne({
          code,
          _id: {
            $ne: subject._id,
          },
        });

      if (duplicateSubject) {
        return res.status(409).json({
          message:
            "Subject with this code already exists",
        });
      }
    }

    const courseChanged =
      courseId !== undefined &&
      courseId.toString() !==
        subject.courseId.toString();

    const semesterChanged =
      semester !== undefined &&
      semester !== subject.semester;

    /**
     * Course/semester changes affect existing academic
     * relationships. Do not silently invalidate them.
     */
    if (courseChanged || semesterChanged) {
      const [
        subjectAssignmentCount,
        assignmentCount,
        resultCount,
        attendanceCount,
      ] = await Promise.all([
        SubjectAssignment.countDocuments({
          subject: subject._id,
        }),

        Assignment.countDocuments({
          subject: subject._id,
        }),

        Result.countDocuments({
          subject: subject._id,
        }),

        Attendance.countDocuments({
          subject: subject._id,
        }),
      ]);

      if (
        subjectAssignmentCount > 0 ||
        assignmentCount > 0 ||
        resultCount > 0 ||
        attendanceCount > 0
      ) {
        return res.status(409).json({
          message:
            "Cannot change the course or semester of a subject while academic records or assignments exist for it",
          dependencies: {
            subjectAssignments:
              subjectAssignmentCount,
            assignments: assignmentCount,
            results: resultCount,
            attendance: attendanceCount,
          },
        });
      }
    }

    if (name !== undefined) {
      subject.name = name;
    }

    if (code !== undefined) {
      subject.code = code;
    }

    if (courseId !== undefined) {
      subject.courseId = targetCourse._id;
    }

    if (semester !== undefined) {
      subject.semester = semester;
    }

    if (credits !== undefined) {
      subject.credits = credits;
    }

    await subject.save();

    const populatedSubject = await Subject.findById(
      subject._id
    ).populate("courseId", "name code");

    return res.status(200).json({
      message: "Subject updated successfully",
      subject: populatedSubject,
    });
  } catch (error) {
    console.error("Update subject error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteSubject = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    const subject = await Subject.findById(
      req.params.id
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const [
      subjectAssignmentCount,
      assignmentCount,
      resultCount,
      attendanceCount,
    ] = await Promise.all([
      SubjectAssignment.countDocuments({
        subject: subject._id,
      }),

      Assignment.countDocuments({
        subject: subject._id,
      }),

      Result.countDocuments({
        subject: subject._id,
      }),

      Attendance.countDocuments({
        subject: subject._id,
      }),
    ]);

    if (
      subjectAssignmentCount > 0 ||
      assignmentCount > 0 ||
      resultCount > 0 ||
      attendanceCount > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete subject because it is still in use",
        dependencies: {
          subjectAssignments:
            subjectAssignmentCount,
          assignments: assignmentCount,
          results: resultCount,
          attendance: attendanceCount,
        },
      });
    }

    await subject.deleteOne();

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};