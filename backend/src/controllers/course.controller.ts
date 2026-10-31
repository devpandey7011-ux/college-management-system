import { Request, Response } from "express";

import Course from "../models/Course.model";
import Student from "../models/Student.model";
import Subject from "../models/Subject.model";
import SubjectAssignment from "../models/SubjectAssignment.model";
import Assignment from "../models/Assignment.model";
import Notice from "../models/Notice.model";

const normalizeText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const normalizeCode = (value: unknown): string => {
  return normalizeText(value).toUpperCase();
};

const validateTotalSemesters = (
  value: unknown
): value is number => {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 12
  );
};

export const createCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const name = normalizeText(req.body.name);
    const code = normalizeCode(req.body.code);
    const department = normalizeText(
      req.body.department
    );
    const totalSemesters =
      req.body.totalSemesters;

    if (
      !name ||
      !code ||
      !department ||
      totalSemesters === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, code, department and totalSemesters are required",
      });
    }

    if (!validateTotalSemesters(totalSemesters)) {
      return res.status(400).json({
        message:
          "Total semesters must be an integer between 1 and 12",
      });
    }

    const existingCourse = await Course.findOne({
      code,
    });

    if (existingCourse) {
      return res.status(409).json({
        message:
          "Course with this code already exists",
      });
    }

    const course = await Course.create({
      name,
      code,
      department,
      totalSemesters,
    });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getCourses = async (
  req: Request,
  res: Response
) => {
  try {
    const courses = await Course.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
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

    const department =
      req.body.department !== undefined
        ? normalizeText(req.body.department)
        : undefined;

    const totalSemesters =
      req.body.totalSemesters;

    if (
      name !== undefined &&
      !name
    ) {
      return res.status(400).json({
        message: "Course name cannot be empty",
      });
    }

    if (
      code !== undefined &&
      !code
    ) {
      return res.status(400).json({
        message: "Course code cannot be empty",
      });
    }

    if (
      department !== undefined &&
      !department
    ) {
      return res.status(400).json({
        message:
          "Course department cannot be empty",
      });
    }

    if (
      totalSemesters !== undefined &&
      !validateTotalSemesters(totalSemesters)
    ) {
      return res.status(400).json({
        message:
          "Total semesters must be an integer between 1 and 12",
      });
    }

    /**
     * Student.course stores the course CODE rather than
     * the Course ObjectId.
     *
     * Therefore changing a course code while students
     * belong to that course would break their relationship.
     */
    if (
      code !== undefined &&
      code !== course.code
    ) {
      const studentsUsingCourse =
        await Student.countDocuments({
          course: course.code,
        });

      if (studentsUsingCourse > 0) {
        return res.status(409).json({
          message:
            "Course code cannot be changed while students are enrolled in this course",
        });
      }

      const duplicateCourse =
        await Course.findOne({
          code,
          _id: {
            $ne: course._id,
          },
        });

      if (duplicateCourse) {
        return res.status(409).json({
          message:
            "Course with this code already exists",
        });
      }

      course.code = code;
    }

    /**
     * Prevent reducing total semesters below an
     * already-existing subject semester.
     */
    if (
      totalSemesters !== undefined &&
      totalSemesters !== course.totalSemesters
    ) {
      const subjectUsingInvalidSemester =
        await Subject.exists({
          courseId: course._id,
          semester: {
            $gt: totalSemesters,
          },
        });

      if (subjectUsingInvalidSemester) {
        return res.status(409).json({
          message:
            "Cannot reduce total semesters because subjects exist beyond the new semester limit",
        });
      }

      /**
       * Students also have their current semester stored.
       * Prevent making an existing student's semester
       * invalid.
       */
      const studentsUsingInvalidSemester =
        await Student.exists({
          course: course.code,
          semester: {
            $gt: totalSemesters,
          },
        });

      if (studentsUsingInvalidSemester) {
        return res.status(409).json({
          message:
            "Cannot reduce total semesters because students are enrolled in a higher semester",
        });
      }

      course.totalSemesters = totalSemesters;
    }

    if (name !== undefined) {
      course.name = name;
    }

    if (department !== undefined) {
      course.department = department;
    }

    await course.save();

    return res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update course error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    /**
     * Do not delete a course that is still referenced
     * by students, subjects, assignments, subject
     * assignments, or notices.
     *
     * This prevents orphaned references.
     */
    const [
      studentCount,
      subjectCount,
      subjectAssignmentCount,
      assignmentCount,
      noticeCount,
    ] = await Promise.all([
      Student.countDocuments({
        course: course.code,
      }),

      Subject.countDocuments({
        courseId: course._id,
      }),

      SubjectAssignment.countDocuments({
        course: course._id,
      }),

      Assignment.countDocuments({
        course: course._id,
      }),

      Notice.countDocuments({
        course: course._id,
      }),
    ]);

    if (
      studentCount > 0 ||
      subjectCount > 0 ||
      subjectAssignmentCount > 0 ||
      assignmentCount > 0 ||
      noticeCount > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete course because it is still in use",
        dependencies: {
          students: studentCount,
          subjects: subjectCount,
          subjectAssignments:
            subjectAssignmentCount,
          assignments: assignmentCount,
          notices: noticeCount,
        },
      });
    }

    await course.deleteOne();

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};