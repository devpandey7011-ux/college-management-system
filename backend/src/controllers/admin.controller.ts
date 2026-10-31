
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.model";
import Student from "../models/Student.model";
import Teacher from "../models/Teacher.model";
import Course from "../models/Course.model";
import Subject from "../models/Subject.model";
import SubjectAssignment from "../models/SubjectAssignment.model";
import Assignment from "../models/Assignment.model";
import Result from "../models/Result.model";
import Attendance from "../models/Attendance.model";
import Notice from "../models/Notice.model";
import AssignmentSubmission from "../models/AssignmentSubmission.model";

import { AuthRequest } from "../middleware/auth.middleware";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;
const MAX_DEPARTMENT_LENGTH = 100;
const MAX_DESIGNATION_LENGTH = 100;

const isValidObjectId = (value: unknown): value is string =>
  typeof value === "string" &&
  mongoose.Types.ObjectId.isValid(value);

const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

const normalizeCode = (code: string): string =>
  code.trim().toUpperCase();

const validateString = (
  value: unknown,
  field: string,
  maxLength: number
): { value: string } | { error: string } => {
  if (typeof value !== "string") {
    return {
      error: `${field} must be a string`,
    };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return {
      error: `${field} cannot be empty`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      error: `${field} cannot exceed ${maxLength} characters`,
    };
  }

  return {
    value: trimmed,
  };
};

const validateEmail = (
  value: unknown
): { value: string } | { error: string } => {
  if (typeof value !== "string") {
    return {
      error: "Email must be a string",
    };
  }

  const email = normalizeEmail(value);

  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return {
      error: "Invalid email address",
    };
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      error: "Invalid email address",
    };
  }

  return {
    value: email,
  };
};

const requireAdmin = (
  req: AuthRequest,
  res: Response
): boolean => {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });

    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      message: "Admin access required",
    });

    return false;
  }

  return true;
};

const handleDuplicateKey = (
  error: unknown,
  res: Response
): boolean => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    res.status(409).json({
      message: "A record with the same unique value already exists",
    });

    return true;
  }

  return false;
};

/* =========================================================
   STUDENTS
========================================================= */

export const createStudent = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const {
      name,
      email,
      password,
      enrollmentNumber,
      course,
      semester,
      phone,
      dateOfBirth,
    } = req.body || {};

    const nameValidation = validateString(
      name,
      "Name",
      MAX_NAME_LENGTH
    );

    if ("error" in nameValidation) {
      return res.status(400).json({
        message: nameValidation.error,
      });
    }

    const emailValidation = validateEmail(email);

    if ("error" in emailValidation) {
      return res.status(400).json({
        message: emailValidation.error,
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message:
          "Password must be between 6 and 128 characters",
      });
    }

    const enrollmentValidation = validateString(
      enrollmentNumber,
      "Enrollment number",
      100
    );

    if ("error" in enrollmentValidation) {
      return res.status(400).json({
        message: enrollmentValidation.error,
      });
    }

    const courseValidation = validateString(
      course,
      "Course",
      50
    );

    if ("error" in courseValidation) {
      return res.status(400).json({
        message: courseValidation.error,
      });
    }

    if (
      typeof semester !== "number" ||
      !Number.isInteger(semester)
    ) {
      return res.status(400).json({
        message: "Semester must be an integer",
      });
    }

    const courseCode =
      normalizeCode(courseValidation.value);

    const courseExists = await Course.findOne({
      code: courseCode,
    }).select("_id code totalSemesters");

    if (!courseExists) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      semester < 1 ||
      semester > courseExists.totalSemesters
    ) {
      return res.status(400).json({
        message:
          `Semester must be between 1 and ${courseExists.totalSemesters}`,
      });
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        message: "Phone must be a string",
      });
    }

    if (
      typeof phone === "string" &&
      phone.trim().length > MAX_PHONE_LENGTH
    ) {
      return res.status(400).json({
        message:
          `Phone cannot exceed ${MAX_PHONE_LENGTH} characters`,
      });
    }

    if (
      dateOfBirth !== undefined &&
      typeof dateOfBirth !== "string" &&
      !(dateOfBirth instanceof Date)
    ) {
      return res.status(400).json({
        message: "Invalid date of birth",
      });
    }

    const normalizedEmail =
      emailValidation.value;

    const normalizedEnrollment =
      enrollmentValidation.value;

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).select("_id");

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    const existingStudent =
      await Student.findOne({
        enrollmentNumber: normalizedEnrollment,
      }).select("_id");

    if (existingStudent) {
      return res.status(409).json({
        message:
          "Student with this enrollment number already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const session =
      await mongoose.startSession();

    let createdUser:
      | {
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
        }
      | undefined;

    let createdStudent:
      | {
          _id: mongoose.Types.ObjectId;
          enrollmentNumber: string;
          course: string;
          semester: number;
          phone?: string;
          dateOfBirth?: Date;
        }
      | undefined;

    try {
      await session.withTransaction(
        async () => {
          const users = await User.create(
            [
              {
                name: nameValidation.value,
                email: normalizedEmail,
                password: hashedPassword,
                role: "student",
              },
            ],
            { session }
          );

          const user = users[0];

          const students =
            await Student.create(
              [
                {
                  userId: user._id,
                  enrollmentNumber:
                    normalizedEnrollment,
                  course: courseExists.code,
                  semester,
                  phone:
                    typeof phone === "string"
                      ? phone.trim()
                      : phone,
                  dateOfBirth,
                },
              ],
              { session }
            );

          const student = students[0];

          createdUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
          };

          createdStudent = {
            _id: student._id,
            enrollmentNumber:
              student.enrollmentNumber,
            course: student.course,
            semester: student.semester,
            phone: student.phone,
            dateOfBirth:
              student.dateOfBirth,
          };
        }
      );
    } finally {
      await session.endSession();
    }

    if (!createdUser || !createdStudent) {
      return res.status(500).json({
        message:
          "Student creation failed",
      });
    }

    return res.status(201).json({
      message: "Student created successfully",
      student: {
        id: createdStudent._id,
        enrollmentNumber:
          createdStudent.enrollmentNumber,
        name: createdUser.name,
        email: createdUser.email,
        course: createdStudent.course,
        semester: createdStudent.semester,
        phone: createdStudent.phone,
        dateOfBirth:
          createdStudent.dateOfBirth,
      },
    });
  } catch (error) {
    console.error(
      "Create student error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllStudents = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const students = await Student.find()
      .populate(
        "userId",
        "name email role"
      )
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .lean();

    return res.status(200).json({
      students,
    });
  } catch (error) {
    console.error(
      "Get all students error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateStudent = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const {
      name,
      email,
      enrollmentNumber,
      course,
      semester,
      phone,
      dateOfBirth,
    } = req.body || {};

    const student =
      await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    let finalCourse =
      student.course;

    if (course !== undefined) {
      const courseValidation =
        validateString(
          course,
          "Course",
          50
        );

      if ("error" in courseValidation) {
        return res.status(400).json({
          message:
            courseValidation.error,
        });
      }

      finalCourse = normalizeCode(
        courseValidation.value
      );
    }

    const finalCourseExists =
      await Course.findOne({
        code: finalCourse,
      }).select(
        "_id code totalSemesters"
      );

    if (!finalCourseExists) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const finalSemester =
      semester !== undefined
        ? semester
        : student.semester;

    if (
      typeof finalSemester !== "number" ||
      !Number.isInteger(finalSemester)
    ) {
      return res.status(400).json({
        message: "Semester must be an integer",
      });
    }

    if (
      finalSemester < 1 ||
      finalSemester >
        finalCourseExists.totalSemesters
    ) {
      return res.status(400).json({
        message:
          `Semester must be between 1 and ${finalCourseExists.totalSemesters}`,
      });
    }

    const courseChanged =
      finalCourse !== student.course;

    const semesterChanged =
      finalSemester !== student.semester;

    if (courseChanged || semesterChanged) {
      const [
        resultCount,
        attendanceCount,
        submissionCount,
      ] = await Promise.all([
        Result.countDocuments({
          student: student._id,
        }),

        Attendance.countDocuments({
          student: student._id,
        }),

        AssignmentSubmission.countDocuments({
          student: student._id,
        }),
      ]);

      if (
        resultCount > 0 ||
        attendanceCount > 0 ||
        submissionCount > 0
      ) {
        return res.status(409).json({
          message:
            "Cannot change student course or semester because academic records already exist",
          dependencies: {
            results: resultCount,
            attendance: attendanceCount,
            submissions:
              submissionCount,
          },
        });
      }
    }

    if (
      name !== undefined
    ) {
      const validation =
        validateString(
          name,
          "Name",
          MAX_NAME_LENGTH
        );

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }
    }

    let normalizedEmail:
      | string
      | undefined;

    if (email !== undefined) {
      const validation =
        validateEmail(email);

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }

      normalizedEmail =
        validation.value;
    }

    let normalizedEnrollment:
      | string
      | undefined;

    if (
      enrollmentNumber !== undefined
    ) {
      const validation =
        validateString(
          enrollmentNumber,
          "Enrollment number",
          100
        );

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }

      normalizedEnrollment =
        validation.value;

      if (
        normalizedEnrollment !==
        student.enrollmentNumber
      ) {
        const existingStudent =
          await Student.findOne({
            enrollmentNumber:
              normalizedEnrollment,
            _id: {
              $ne: student._id,
            },
          }).select("_id");

        if (existingStudent) {
          return res.status(409).json({
            message:
              "Student with this enrollment number already exists",
          });
        }
      }
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        message: "Phone must be a string",
      });
    }

    if (
      typeof phone === "string" &&
      phone.trim().length >
        MAX_PHONE_LENGTH
    ) {
      return res.status(400).json({
        message:
          `Phone cannot exceed ${MAX_PHONE_LENGTH} characters`,
      });
    }

    const user =
      await User.findById(student.userId);

    if (!user) {
      return res.status(404).json({
        message:
          "Associated user not found",
      });
    }

    if (
      normalizedEmail !== undefined &&
      normalizedEmail !== user.email
    ) {
      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: user._id,
          },
        }).select("_id");

      if (existingUser) {
        return res.status(409).json({
          message:
            "User with this email already exists",
        });
      }
    }

    /*
     * Save both documents in a transaction so a failure
     * cannot leave the User and Student profiles out of sync.
     */
    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          if (courseChanged) {
            student.course =
              finalCourse;
          }

          if (semesterChanged) {
            student.semester =
              finalSemester;
          }

          if (
            normalizedEnrollment !==
            undefined
          ) {
            student.enrollmentNumber =
              normalizedEnrollment;
          }

          if (
            phone !== undefined
          ) {
            student.phone =
              phone.trim();
          }

          if (
            dateOfBirth !== undefined
          ) {
            student.dateOfBirth =
              dateOfBirth;
          }

          if (
            name !== undefined
          ) {
            const validation =
              validateString(
                name,
                "Name",
                MAX_NAME_LENGTH
              );

            if ("value" in validation) {
              user.name =
                validation.value;
            }
          }

          if (
            normalizedEmail !==
            undefined
          ) {
            user.email =
              normalizedEmail;
          }

          await user.save({
            session,
          });

          await student.save({
            session,
          });
        }
      );
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message:
        "Student updated successfully",
      student: {
        id: student._id,
        enrollmentNumber:
          student.enrollmentNumber,
        name: user.name,
        email: user.email,
        course: student.course,
        semester: student.semester,
        phone: student.phone,
        dateOfBirth:
          student.dateOfBirth,
      },
    });
  } catch (error) {
    console.error(
      "Update student error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteStudent = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const student =
      await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const [
      resultCount,
      attendanceCount,
      submissionCount,
    ] = await Promise.all([
      Result.countDocuments({
        student: student._id,
      }),

      Attendance.countDocuments({
        student: student._id,
      }),

      AssignmentSubmission.countDocuments({
        student: student._id,
      }),
    ]);

    if (
      resultCount > 0 ||
      attendanceCount > 0 ||
      submissionCount > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete student because the student is still referenced by academic records",
        dependencies: {
          results: resultCount,
          attendance: attendanceCount,
          submissions:
            submissionCount,
        },
      });
    }

    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          await User.deleteOne(
            {
              _id: student.userId,
            },
            {
              session,
            }
          );

          await Student.deleteOne(
            {
              _id: student._id,
            },
            {
              session,
            }
          );
        }
      );
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message:
        "Student deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete student error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================================================
   TEACHERS
========================================================= */

export const createTeacher = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const {
      name,
      email,
      password,
      teacherId,
      department,
      designation,
      phone,
    } = req.body || {};

    const nameValidation = validateString(
      name,
      "Name",
      MAX_NAME_LENGTH
    );

    if ("error" in nameValidation) {
      return res.status(400).json({
        message: nameValidation.error,
      });
    }

    const emailValidation =
      validateEmail(email);

    if ("error" in emailValidation) {
      return res.status(400).json({
        message:
          emailValidation.error,
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message:
          "Password must be between 6 and 128 characters",
      });
    }

    const teacherIdValidation =
      validateString(
        teacherId,
        "Teacher ID",
        100
      );

    if ("error" in teacherIdValidation) {
      return res.status(400).json({
        message:
          teacherIdValidation.error,
      });
    }

    const departmentValidation =
      validateString(
        department,
        "Department",
        MAX_DEPARTMENT_LENGTH
      );

    if ("error" in departmentValidation) {
      return res.status(400).json({
        message:
          departmentValidation.error,
      });
    }

    const designationValidation =
      validateString(
        designation,
        "Designation",
        MAX_DESIGNATION_LENGTH
      );

    if ("error" in designationValidation) {
      return res.status(400).json({
        message:
          designationValidation.error,
      });
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        message: "Phone must be a string",
      });
    }

    const normalizedEmail =
      emailValidation.value;

    const normalizedTeacherId =
      teacherIdValidation.value;

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      }).select("_id");

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    const existingTeacher =
      await Teacher.findOne({
        teacherId:
          normalizedTeacherId,
      }).select("_id");

    if (existingTeacher) {
      return res.status(409).json({
        message:
          "Teacher with this ID already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const session =
      await mongoose.startSession();

    let createdUser:
      | {
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
        }
      | undefined;

    let createdTeacher:
      | {
          _id: mongoose.Types.ObjectId;
          teacherId: string;
          department: string;
          designation: string;
          phone?: string;
        }
      | undefined;

    try {
      await session.withTransaction(
        async () => {
          const users = await User.create(
            [
              {
                name:
                  nameValidation.value,
                email: normalizedEmail,
                password:
                  hashedPassword,
                role: "teacher",
              },
            ],
            {
              session,
            }
          );

          const user = users[0];

          const teachers =
            await Teacher.create(
              [
                {
                  user: user._id,
                  teacherId:
                    normalizedTeacherId,
                  department:
                    departmentValidation.value,
                  designation:
                    designationValidation.value,
                  phone:
                    typeof phone ===
                    "string"
                      ? phone.trim()
                      : phone,
                },
              ],
              {
                session,
              }
            );

          const teacher =
            teachers[0];

          createdUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
          };

          createdTeacher = {
            _id: teacher._id,
            teacherId:
              teacher.teacherId,
            department:
              teacher.department,
            designation:
              teacher.designation,
            phone: teacher.phone,
          };
        }
      );
    } finally {
      await session.endSession();
    }

    if (
      !createdUser ||
      !createdTeacher
    ) {
      return res.status(500).json({
        message:
          "Teacher creation failed",
      });
    }

    return res.status(201).json({
      message:
        "Teacher created successfully",
      teacher: {
        id: createdTeacher._id,
        teacherId:
          createdTeacher.teacherId,
        name: createdUser.name,
        email: createdUser.email,
        department:
          createdTeacher.department,
        designation:
          createdTeacher.designation,
        phone:
          createdTeacher.phone,
      },
    });
  } catch (error) {
    console.error(
      "Create teacher error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllTeachers = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const teachers = await Teacher.find()
      .populate(
        "user",
        "name email role"
      )
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .lean();

    return res.status(200).json({
      teachers,
    });
  } catch (error) {
    console.error(
      "Get all teachers error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateTeacher = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid teacher ID",
      });
    }

    const {
      name,
      email,
      teacherId,
      department,
      designation,
      phone,
    } = req.body || {};

    const teacher =
      await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    let normalizedTeacherId:
      | string
      | undefined;

    if (
      teacherId !== undefined
    ) {
      const validation =
        validateString(
          teacherId,
          "Teacher ID",
          100
        );

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }

      normalizedTeacherId =
        validation.value;

      if (
        normalizedTeacherId !==
        teacher.teacherId
      ) {
        const existingTeacher =
          await Teacher.findOne({
            teacherId:
              normalizedTeacherId,
            _id: {
              $ne: teacher._id,
            },
          }).select("_id");

        if (existingTeacher) {
          return res.status(409).json({
            message:
              "Teacher with this ID already exists",
          });
        }
      }
    }

    let normalizedEmail:
      | string
      | undefined;

    if (email !== undefined) {
      const validation =
        validateEmail(email);

      if ("error" in validation) {
        return res.status(400).json({
          message:
            validation.error,
        });
      }

      normalizedEmail =
        validation.value;
    }

    if (name !== undefined) {
      const validation =
        validateString(
          name,
          "Name",
          MAX_NAME_LENGTH
        );

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }
    }

    if (
      department !== undefined
    ) {
      const validation =
        validateString(
          department,
          "Department",
          MAX_DEPARTMENT_LENGTH
        );

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }
    }

    if (
      designation !== undefined
    ) {
      const validation =
        validateString(
          designation,
          "Designation",
          MAX_DESIGNATION_LENGTH
        );

      if ("error" in validation) {
        return res.status(400).json({
          message: validation.error,
        });
      }
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        message: "Phone must be a string",
      });
    }

    const user =
      await User.findById(teacher.user);

    if (!user) {
      return res.status(404).json({
        message:
          "Associated user not found",
      });
    }

    if (
      normalizedEmail !== undefined &&
      normalizedEmail !== user.email
    ) {
      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: user._id,
          },
        }).select("_id");

      if (existingUser) {
        return res.status(409).json({
          message:
            "User with this email already exists",
        });
      }
    }

    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          if (
            normalizedTeacherId !==
            undefined
          ) {
            teacher.teacherId =
              normalizedTeacherId;
          }

          if (
            department !== undefined
          ) {
            teacher.department =
              (
                validateString(
                  department,
                  "Department",
                  MAX_DEPARTMENT_LENGTH
                ) as {
                  value: string;
                }
              ).value;
          }

          if (
            designation !==
            undefined
          ) {
            teacher.designation =
              (
                validateString(
                  designation,
                  "Designation",
                  MAX_DESIGNATION_LENGTH
                ) as {
                  value: string;
                }
              ).value;
          }

          if (
            phone !== undefined
          ) {
            teacher.phone =
              phone.trim();
          }

          if (
            name !== undefined
          ) {
            user.name =
              (
                validateString(
                  name,
                  "Name",
                  MAX_NAME_LENGTH
                ) as {
                  value: string;
                }
              ).value;
          }

          if (
            normalizedEmail !==
            undefined
          ) {
            user.email =
              normalizedEmail;
          }

          await user.save({
            session,
          });

          await teacher.save({
            session,
          });
        }
      );
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message:
        "Teacher updated successfully",
      teacher: {
        id: teacher._id,
        teacherId:
          teacher.teacherId,
        name: user.name,
        email: user.email,
        department:
          teacher.department,
        designation:
          teacher.designation,
        phone: teacher.phone,
      },
    });
  } catch (error) {
    console.error(
      "Update teacher error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteTeacher = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid teacher ID",
      });
    }

    const teacher =
      await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    const [
      subjectAssignmentCount,
      assignmentCount,
      resultCount,
      attendanceCount,
    ] = await Promise.all([
      SubjectAssignment.countDocuments({
        teacher: teacher._id,
      }),

      Assignment.countDocuments({
        teacher: teacher._id,
      }),

      Result.countDocuments({
        teacher: teacher._id,
      }),

      Attendance.countDocuments({
        teacher: teacher._id,
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
          "Cannot delete teacher because the teacher is still referenced by academic records",
        dependencies: {
          subjectAssignments:
            subjectAssignmentCount,
          assignments:
            assignmentCount,
          results: resultCount,
          attendance:
            attendanceCount,
        },
      });
    }

    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          await User.deleteOne(
            {
              _id: teacher.user,
            },
            {
              session,
            }
          );

          await Teacher.deleteOne(
            {
              _id: teacher._id,
            },
            {
              session,
            }
          );
        }
      );
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message:
        "Teacher deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete teacher error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================================================
   SUBJECT ASSIGNMENTS
========================================================= */

export const createSubjectAssignment = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const {
      teacher,
      subject,
      course,
    } = req.body || {};

    if (
      !isValidObjectId(teacher) ||
      !isValidObjectId(subject) ||
      !isValidObjectId(course)
    ) {
      return res.status(400).json({
        message:
          "Teacher, subject and course must be valid IDs",
      });
    }

    const [
      teacherExists,
      subjectExists,
      courseExists,
    ] = await Promise.all([
      Teacher.findById(teacher).select(
        "_id"
      ),

      Subject.findById(subject).select(
        "_id courseId semester"
      ),

      Course.findById(course).select(
        "_id totalSemesters"
      ),
    ]);

    if (!teacherExists) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    if (!courseExists) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      subjectExists.courseId.toString() !==
      courseExists._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Selected subject does not belong to the selected course",
      });
    }

    if (
      subjectExists.semester < 1 ||
      subjectExists.semester >
        courseExists.totalSemesters
    ) {
      return res.status(400).json({
        message:
          `Subject semester must be between 1 and ${courseExists.totalSemesters}`,
      });
    }

    const existingAssignment =
      await SubjectAssignment.findOne({
        teacher:
          teacherExists._id,
        subject:
          subjectExists._id,
      }).select("_id");

    if (existingAssignment) {
      return res.status(409).json({
        message:
          "Teacher is already assigned to this subject",
      });
    }

    const assignment =
      await SubjectAssignment.create({
        teacher:
          teacherExists._id,
        subject:
          subjectExists._id,
        course:
          courseExists._id,
      });

    const populatedAssignment =
      await SubjectAssignment.findById(
        assignment._id
      )
        .populate(
          "teacher",
          "teacherId department designation"
        )
        .populate(
          "subject",
          "name code semester credits"
        )
        .populate(
          "course",
          "name code"
        );

    return res.status(201).json({
      message:
        "Subject assigned to teacher successfully",
      assignment:
        populatedAssignment,
    });
  } catch (error) {
    console.error(
      "Create subject assignment error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSubjectAssignments = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const assignments =
      await SubjectAssignment.find()
        .populate(
          "teacher",
          "teacherId department designation"
        )
        .populate(
          "subject",
          "name code semester credits"
        )
        .populate(
          "course",
          "name code"
        )
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .lean();

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(
      "Get subject assignments error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteSubjectAssignment = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message:
          "Invalid subject assignment ID",
      });
    }

    const assignment =
      await SubjectAssignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        message:
          "Subject assignment not found",
      });
    }

    const [
      assignmentCount,
      resultCount,
      attendanceCount,
    ] = await Promise.all([
      Assignment.countDocuments({
        teacher:
          assignment.teacher,
        subject:
          assignment.subject,
        course:
          assignment.course,
      }),

      Result.countDocuments({
        teacher:
          assignment.teacher,
        subject:
          assignment.subject,
      }),

      Attendance.countDocuments({
        teacher:
          assignment.teacher,
        subject:
          assignment.subject,
      }),
    ]);

    if (
      assignmentCount > 0 ||
      resultCount > 0 ||
      attendanceCount > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete subject assignment because academic records exist for this teacher and subject",
        dependencies: {
          assignments:
            assignmentCount,
          results:
            resultCount,
          attendance:
            attendanceCount,
        },
      });
    }

    const deletedAssignment =
      await SubjectAssignment.findOneAndDelete({
        _id: assignment._id,
      });

    if (!deletedAssignment) {
      return res.status(404).json({
        message:
          "Subject assignment no longer exists",
      });
    }

    return res.status(200).json({
      message:
        "Subject assignment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete subject assignment error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================================================
   COURSES
========================================================= */

export const createCourse = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const {
      name,
      code,
      department,
      totalSemesters,
    } = req.body || {};

    const nameValidation =
      validateString(
        name,
        "Name",
        200
      );

    if ("error" in nameValidation) {
      return res.status(400).json({
        message:
          nameValidation.error,
      });
    }

    const codeValidation =
      validateString(
        code,
        "Code",
        50
      );

    if ("error" in codeValidation) {
      return res.status(400).json({
        message:
          codeValidation.error,
      });
    }

    const departmentValidation =
      validateString(
        department,
        "Department",
        MAX_DEPARTMENT_LENGTH
      );

    if (
      "error" in departmentValidation
    ) {
      return res.status(400).json({
        message:
          departmentValidation.error,
      });
    }

    if (
      typeof totalSemesters !==
        "number" ||
      !Number.isInteger(
        totalSemesters
      ) ||
      totalSemesters < 1 ||
      totalSemesters > 12
    ) {
      return res.status(400).json({
        message:
          "Total semesters must be an integer between 1 and 12",
      });
    }

    const normalizedCode =
      normalizeCode(
        codeValidation.value
      );

    const existingCourse =
      await Course.findOne({
        code: normalizedCode,
      }).select("_id");

    if (existingCourse) {
      return res.status(409).json({
        message:
          "Course with this code already exists",
      });
    }

    const course =
      await Course.create({
        name:
          nameValidation.value,
        code: normalizedCode,
        department:
          departmentValidation.value,
        totalSemesters,
      });

    return res.status(201).json({
      message:
        "Course created successfully",
      course,
    });
  } catch (error) {
    console.error(
      "Create course error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllCourses = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const courses =
      await Course.find()
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .lean();

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error(
      "Get all courses error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const {
      name,
      code,
      department,
      totalSemesters,
    } = req.body || {};

    const course =
      await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    let newCourseCode =
      course.code;

    if (code !== undefined) {
      const validation =
        validateString(
          code,
          "Code",
          50
        );

      if ("error" in validation) {
        return res.status(400).json({
          message:
            validation.error,
        });
      }

      newCourseCode =
        normalizeCode(
          validation.value
        );
    }

    const courseCodeChanged =
      newCourseCode !==
      course.code;

    if (courseCodeChanged) {
      const existingCourse =
        await Course.findOne({
          code: newCourseCode,
          _id: {
            $ne: course._id,
          },
        }).select("_id");

      if (existingCourse) {
        return res.status(409).json({
          message:
            "Course with this code already exists",
        });
      }

      const studentCount =
        await Student.countDocuments({
          course: course.code,
        });

      if (studentCount > 0) {
        return res.status(409).json({
          message:
            "Cannot change course code because students are already enrolled in this course",
          dependencies: {
            students:
              studentCount,
          },
        });
      }
    }

    if (
      name !== undefined
    ) {
      const validation =
        validateString(
          name,
          "Name",
          200
        );

      if ("error" in validation) {
        return res.status(400).json({
          message:
            validation.error,
        });
      }
    }

    if (
      department !== undefined
    ) {
      const validation =
        validateString(
          department,
          "Department",
          MAX_DEPARTMENT_LENGTH
        );

      if ("error" in validation) {
        return res.status(400).json({
          message:
            validation.error,
        });
      }
    }

    if (
      totalSemesters !==
      undefined
    ) {
      if (
        typeof totalSemesters !==
          "number" ||
        !Number.isInteger(
          totalSemesters
        ) ||
        totalSemesters < 1 ||
        totalSemesters > 12
      ) {
        return res.status(400).json({
          message:
            "Total semesters must be an integer between 1 and 12",
        });
      }

      if (
        totalSemesters <
        course.totalSemesters
      ) {
        const [
          studentDependency,
          subjectDependency,
        ] = await Promise.all([
          Student.findOne({
            course:
              course.code,
            semester: {
              $gt:
                totalSemesters,
            },
          }).select("_id"),

          Subject.findOne({
            courseId:
              course._id,
            semester: {
              $gt:
                totalSemesters,
            },
          }).select("_id"),
        ]);

        if (
          studentDependency ||
          subjectDependency
        ) {
          return res.status(409).json({
            message:
              "Cannot reduce course semesters because students or subjects exist beyond the new semester limit",
          });
        }
      }
    }

    if (
      courseCodeChanged
    ) {
      course.code =
        newCourseCode;
    }

    if (
      name !== undefined
    ) {
      course.name =
        (
          validateString(
            name,
            "Name",
            200
          ) as {
            value: string;
          }
        ).value;
    }

    if (
      department !==
      undefined
    ) {
      course.department =
        (
          validateString(
            department,
            "Department",
            MAX_DEPARTMENT_LENGTH
          ) as {
            value: string;
          }
        ).value;
    }

    if (
      totalSemesters !==
      undefined
    ) {
      course.totalSemesters =
        totalSemesters;
    }

    await course.save();

    return res.status(200).json({
      message:
        "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error(
      "Update course error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course =
      await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const [
      studentCount,
      subjectCount,
      subjectAssignmentCount,
      assignmentCount,
      noticeCount,
    ] = await Promise.all([
      Student.countDocuments({
        course:
          course.code,
      }),

      Subject.countDocuments({
        courseId:
          course._id,
      }),

      SubjectAssignment.countDocuments({
        course:
          course._id,
      }),

      Assignment.countDocuments({
        course:
          course._id,
      }),

      Notice.countDocuments({
        course:
          course._id,
      }),
    ]);

    if (
      studentCount > 0 ||
      subjectCount > 0 ||
      subjectAssignmentCount >
        0 ||
      assignmentCount > 0 ||
      noticeCount > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete course because the course is still referenced by academic records",
        dependencies: {
          students:
            studentCount,
          subjects:
            subjectCount,
          subjectAssignments:
            subjectAssignmentCount,
          assignments:
            assignmentCount,
          notices:
            noticeCount,
        },
      });
    }

    const deletedCourse =
      await Course.findOneAndDelete({
        _id: course._id,
      });

    if (!deletedCourse) {
      return res.status(404).json({
        message:
          "Course no longer exists",
      });
    }

    return res.status(200).json({
      message:
        "Course deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete course error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================================================
   SUBJECTS
========================================================= */

export const createSubject = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const {
      name,
      code,
      courseId,
      semester,
      credits,
    } = req.body || {};

    const nameValidation =
      validateString(
        name,
        "Name",
        200
      );

    if ("error" in nameValidation) {
      return res.status(400).json({
        message:
          nameValidation.error,
      });
    }

    const codeValidation =
      validateString(
        code,
        "Code",
        50
      );

    if ("error" in codeValidation) {
      return res.status(400).json({
        message:
          codeValidation.error,
      });
    }

    if (
      !isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        message:
          "Invalid course ID",
      });
    }

    if (
      typeof semester !==
        "number" ||
      !Number.isInteger(
        semester
      ) ||
      semester < 1 ||
      semester > 12
    ) {
      return res.status(400).json({
        message:
          "Semester must be an integer between 1 and 12",
      });
    }

    if (
      typeof credits !==
        "number" ||
      !Number.isInteger(
        credits
      ) ||
      credits < 1 ||
      credits > 10
    ) {
      return res.status(400).json({
        message:
          "Credits must be an integer between 1 and 10",
      });
    }

    const courseExists =
      await Course.findById(
        courseId
      ).select(
        "_id totalSemesters"
      );

    if (!courseExists) {
      return res.status(404).json({
        message:
          "Course not found",
      });
    }

    if (
      semester >
      courseExists.totalSemesters
    ) {
      return res.status(400).json({
        message:
          `Semester must be between 1 and ${courseExists.totalSemesters}`,
      });
    }

    const normalizedCode =
      normalizeCode(
        codeValidation.value
      );

    const existingSubject =
      await Subject.findOne({
        code: normalizedCode,
      }).select("_id");

    if (existingSubject) {
      return res.status(409).json({
        message:
          "Subject with this code already exists",
      });
    }

    const subject =
      await Subject.create({
        name:
          nameValidation.value,
        code: normalizedCode,
        courseId:
          courseExists._id,
        semester,
        credits,
      });

    const populatedSubject =
      await Subject.findById(
        subject._id
      ).populate(
        "courseId",
        "name code"
      );

    return res.status(201).json({
      message:
        "Subject created successfully",
      subject:
        populatedSubject,
    });
  } catch (error) {
    console.error(
      "Create subject error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllSubjects = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const subjects =
      await Subject.find()
        .populate(
          "courseId",
          "name code"
        )
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .lean();

    return res.status(200).json({
      subjects,
    });
  } catch (error) {
    console.error(
      "Get subjects error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateSubject = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    const {
      name,
      code,
      courseId,
      semester,
      credits,
    } = req.body || {};

    const subject =
      await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        message:
          "Subject not found",
      });
    }

    if (
      name !== undefined
    ) {
      const validation =
        validateString(
          name,
          "Name",
          200
        );

      if ("error" in validation) {
        return res.status(400).json({
          message:
            validation.error,
        });
      }
    }

    if (
      code !== undefined
    ) {
      const validation =
        validateString(
          code,
          "Code",
          50
        );

      if ("error" in validation) {
        return res.status(400).json({
          message:
            validation.error,
        });
      }
    }

    if (
      courseId !== undefined &&
      !isValidObjectId(
        courseId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid course ID",
      });
    }

    if (
      semester !== undefined &&
      (
        typeof semester !==
          "number" ||
        !Number.isInteger(
          semester
        ) ||
        semester < 1 ||
        semester > 12
      )
    ) {
      return res.status(400).json({
        message:
          "Semester must be an integer between 1 and 12",
      });
    }

    if (
      credits !== undefined &&
      (
        typeof credits !==
          "number" ||
        !Number.isInteger(
          credits
        ) ||
        credits < 1 ||
        credits > 10
      )
    ) {
      return res.status(400).json({
        message:
          "Credits must be an integer between 1 and 10",
      });
    }

    const finalCourseId =
      courseId !== undefined
        ? courseId
        : subject.courseId;

    const finalSemester =
      semester !== undefined
        ? semester
        : subject.semester;

    const courseExists =
      await Course.findById(
        finalCourseId
      ).select(
        "_id totalSemesters"
      );

    if (!courseExists) {
      return res.status(404).json({
        message:
          "Course not found",
      });
    }

    if (
      finalSemester < 1 ||
      finalSemester >
        courseExists.totalSemesters
    ) {
      return res.status(400).json({
        message:
          `Semester must be between 1 and ${courseExists.totalSemesters}`,
      });
    }

    const courseChanged =
      subject.courseId.toString() !==
      courseExists._id.toString();

    const semesterChanged =
      subject.semester !==
      finalSemester;

    if (
      courseChanged ||
      semesterChanged
    ) {
      const [
        subjectAssignmentCount,
        assignmentCount,
        resultCount,
        attendanceCount,
      ] = await Promise.all([
        SubjectAssignment.countDocuments({
          subject:
            subject._id,
        }),

        Assignment.countDocuments({
          subject:
            subject._id,
        }),

        Result.countDocuments({
          subject:
            subject._id,
        }),

        Attendance.countDocuments({
          subject:
            subject._id,
        }),
      ]);

      if (
        subjectAssignmentCount >
          0 ||
        assignmentCount > 0 ||
        resultCount > 0 ||
        attendanceCount > 0
      ) {
        return res.status(409).json({
          message:
            "Cannot change subject course or semester because the subject is already referenced by academic records",
          dependencies: {
            subjectAssignments:
              subjectAssignmentCount,
            assignments:
              assignmentCount,
            results:
              resultCount,
            attendance:
              attendanceCount,
          },
        });
      }
    }

    if (
      courseChanged
    ) {
      subject.courseId =
        courseExists._id;
    }

    if (
      code !== undefined
    ) {
      const normalizedCode =
        normalizeCode(
          code
        );

      const existingSubject =
        await Subject.findOne({
          code:
            normalizedCode,
          _id: {
            $ne:
              subject._id,
          },
        }).select("_id");

      if (existingSubject) {
        return res.status(409).json({
          message:
            "Subject with this code already exists",
        });
      }

      subject.code =
        normalizedCode;
    }

    if (
      name !== undefined
    ) {
      subject.name =
        (
          validateString(
            name,
            "Name",
            200
          ) as {
            value: string;
          }
        ).value;
    }

    if (
      semester !== undefined
    ) {
      subject.semester =
        finalSemester;
    }

    if (
      credits !== undefined
    ) {
      subject.credits =
        credits;
    }

    await subject.save();

    const populatedSubject =
      await Subject.findById(
        subject._id
      ).populate(
        "courseId",
        "name code"
      );

    return res.status(200).json({
      message:
        "Subject updated successfully",
      subject:
        populatedSubject,
    });
  } catch (error) {
    console.error(
      "Update subject error:",
      error
    );

    if (handleDuplicateKey(error, res)) {
      return;
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteSubject = async (
  req: AuthRequest,
  res: Response
) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    const subject =
      await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        message:
          "Subject not found",
      });
    }

    const [
      subjectAssignmentCount,
      assignmentCount,
      resultCount,
      attendanceCount,
    ] = await Promise.all([
      SubjectAssignment.countDocuments({
        subject:
          subject._id,
      }),

      Assignment.countDocuments({
        subject:
          subject._id,
      }),

      Result.countDocuments({
        subject:
          subject._id,
      }),

      Attendance.countDocuments({
        subject:
          subject._id,
      }),
    ]);

    if (
      subjectAssignmentCount >
        0 ||
      assignmentCount > 0 ||
      resultCount > 0 ||
      attendanceCount > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete subject because the subject is still referenced by academic records",
        dependencies: {
          subjectAssignments:
            subjectAssignmentCount,
          assignments:
            assignmentCount,
          results:
            resultCount,
          attendance:
            attendanceCount,
        },
      });
    }

    const deletedSubject =
      await Subject.findOneAndDelete({
        _id: subject._id,
      });

    if (!deletedSubject) {
      return res.status(404).json({
        message:
          "Subject no longer exists",
      });
    }

    return res.status(200).json({
      message:
        "Subject deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete subject error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};
