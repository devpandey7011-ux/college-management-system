import { Response } from "express";
import Teacher from "../models/Teacher.model";
import { AuthRequest } from "../middleware/auth.middleware";
import SubjectAssignment from "../models/SubjectAssignment.model";
import Student from "../models/Student.model";

export const getTeacherProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const teacher = await Teacher.findOne({
      user: req.user.id,
    }).populate("user", "name email role");

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    return res.status(200).json({
      teacher,
    });
  } catch (error) {
    console.error("Get teacher profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateTeacherProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { phone } = req.body;

    const teacher = await Teacher.findOne({
      user: req.user.id,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    if (phone !== undefined) {
      teacher.phone = phone;
    }

    await teacher.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      teacher,
    });
  } catch (error) {
    console.error("Update teacher profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTeacherStudents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
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

    const assignments = await SubjectAssignment.find({
      teacher: teacher._id,
    })
      .populate("course", "name code")
      .populate("subject", "name code semester");

    if (assignments.length === 0) {
      return res.status(200).json([]);
    }

    // Build valid Course + Semester combinations
    // from the teacher's actual subject assignments.
    const academicScopes = assignments
      .map((assignment) => {
        const course = assignment.course as unknown as {
          _id: string;
          name: string;
          code: string;
        };

        const subject = assignment.subject as unknown as {
          _id: string;
          name: string;
          code: string;
          semester: number;
        };

        if (!course?.code || !subject?.semester) {
          return null;
        }

        return {
          course: course.code,
          semester: subject.semester,
        };
      })
      .filter(
        (
          scope
        ): scope is {
          course: string;
          semester: number;
        } => scope !== null
      );

    if (academicScopes.length === 0) {
      return res.status(200).json([]);
    }

    // Remove duplicate Course + Semester combinations.
    const uniqueScopes = Array.from(
      new Map(
        academicScopes.map((scope) => [
          `${scope.course}-${scope.semester}`,
          scope,
        ])
      ).values()
    );

    // Build an OR query so the teacher only receives
    // students belonging to their assigned course + semester.
    
    const students = await Student.find({
      $or: uniqueScopes.map((scope) => ({
        course: scope.course,
        semester: scope.semester,
      })),
    })
      .populate("userId", "name email role")
      .sort({
        course: 1,
        semester: 1,
        enrollmentNumber: 1,
      });

    const result = students.map((student) => {
      const user = student.userId as unknown as {
        _id: string;
        name: string;
        email: string;
        role: string;
      };

      return {
        id: student._id,
        name: user.name,
        email: user.email,
        enrollmentNumber: student.enrollmentNumber,
        course: student.course,
        semester: student.semester,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get teacher students error:", error);

    return res.status(500).json({
      message: "Failed to get teacher students",
    });
  }
};

export const getTeacherSubjectAssignments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
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

    const assignments = await SubjectAssignment.find({
      teacher: teacher._id,
    })
      .populate("course", "name code")
      .populate("subject", "name code semester credits")
      .sort({
        course: 1,
        "subject.semester": 1,
      });

    const result = assignments.map((assignment) => {
      const course = assignment.course as unknown as {
        _id: string;
        name: string;
        code: string;
      };

      const subject = assignment.subject as unknown as {
        _id: string;
        name: string;
        code: string;
        semester: number;
        credits: number;
      };

      return {
        _id: assignment._id,
        course: {
          _id: course._id,
          name: course.name,
          code: course.code,
        },
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          credits: subject.credits,
        },
      };
    });

    return res.status(200).json({
      assignments: result,
    });
  } catch (error) {
    console.error(
      "Get teacher subject assignments error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get teacher subject assignments",
    });
  }
};