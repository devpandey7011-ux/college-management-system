
import { Request, Response } from "express";
import mongoose from "mongoose";

import Notice, { NoticeAudience } from "../models/Notice.model";
import Course from "../models/Course.model";
import Student from "../models/Student.model";
import Teacher from "../models/Teacher.model";
import SubjectAssignment from "../models/SubjectAssignment.model";

import { AuthRequest } from "../middleware/auth.middleware";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;

const isValidString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isValidAudience = (value: unknown): value is NoticeAudience =>
  value === "all" || value === "students" || value === "teachers";

const isValidObjectId = (value: unknown): value is string =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

const isValidOptionalBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const getUserCourseIds = async (
  userId: string,
  role: "student" | "teacher"
): Promise<string[]> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return [];
  }

  if (role === "student") {
    const student = await Student.findOne({ user: userId })
      .select("course")
      .lean();

    if (!student?.course) {
      return [];
    }

    return [String(student.course)];
  }

  const teacher = await Teacher.findOne({ user: userId })
    .select("_id")
    .lean();

  if (!teacher) {
    return [];
  }

  const assignments = await SubjectAssignment.find({
    teacher: teacher._id,
  })
    .select("course")
    .lean();

  return [
    ...new Set(
      assignments
        .map((assignment) => assignment.course)
        .filter(Boolean)
        .map((course) => String(course))
    ),
  ];
};

const canViewNotice = async (
  notice: {
    audience: NoticeAudience;
    course?: mongoose.Types.ObjectId | null;
  },
  userId: string,
  role: "admin" | "student" | "teacher"
): Promise<boolean> => {
  if (role === "admin") {
    return true;
  }

  if (role === "student" && notice.audience === "teachers") {
    return false;
  }

  if (role === "teacher" && notice.audience === "students") {
    return false;
  }

  if (!notice.course) {
    return true;
  }

  const userCourseIds = await getUserCourseIds(userId, role);

  return userCourseIds.includes(String(notice.course));
};

// Create a notice (admin only)
export const createNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, audience, course, isPublic } = req.body;

    if (!isValidString(title) || title.trim().length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        message: `Title is required and must not exceed ${MAX_TITLE_LENGTH} characters`,
      });
    }

    if (
      !isValidString(content) ||
      content.trim().length > MAX_CONTENT_LENGTH
    ) {
      return res.status(400).json({
        message: `Content is required and must not exceed ${MAX_CONTENT_LENGTH} characters`,
      });
    }

    if (audience !== undefined && !isValidAudience(audience)) {
      return res.status(400).json({
        message: "Invalid notice audience",
      });
    }

    if (isPublic !== undefined && !isValidOptionalBoolean(isPublic)) {
      return res.status(400).json({
        message: "isPublic must be a boolean",
      });
    }

    let courseId: mongoose.Types.ObjectId | undefined;

    if (course !== undefined && course !== null && course !== "") {
      if (!isValidObjectId(course)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const existingCourse = await Course.findById(course).select("_id");

      if (!existingCourse) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      courseId = new mongoose.Types.ObjectId(course);
    }

    const noticeAudience: NoticeAudience = audience ?? "all";

    // Public notices must be general notices, not course-specific notices.
    if (isPublic === true && (noticeAudience !== "all" || courseId)) {
      return res.status(400).json({
        message:
          'Public notices must have audience "all" and cannot target a specific course',
      });
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      audience: noticeAudience,
      course: courseId,
      createdBy: req.user!.id,
      isPublic: isPublic ?? false,
    });

    return res.status(201).json({
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("Create notice error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get notices available to the public (no authentication required)
// Get public notices without authentication
export const getPublicNotices = async (
  _req: Request,
  res: Response
) => {
  try {
    const notices = await Notice.find({
      isPublic: true,
      audience: "all",
      $or: [
        { course: { $exists: false } },
        { course: null },
      ],
    })
      .select("title content audience isPublic createdAt updatedAt")
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({ notices });
  } catch (error) {
    console.error("Get public notices error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get notices visible to the logged-in user
export const getNotices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role === "admin") {
      const notices = await Notice.find()
        .populate("course", "name code")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .lean();

      return res.status(200).json({ notices });
    }

    const userCourseIds = await getUserCourseIds(
      userId,
      role as "student" | "teacher"
    );

   const audienceFilter: NoticeAudience[] =
  role === "student"
    ? ["all", "students"]
    : ["all", "teachers"];

    const courseObjectIds = userCourseIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const notices = await Notice.find({
      audience: { $in: audienceFilter },
      $or: [
        { course: { $exists: false } },
        { course: null },
        { course: { $in: courseObjectIds } },
      ],
    })
      .populate("course", "name code")
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({ notices });
  } catch (error) {
    console.error("Get notices error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get a single notice

export const getNoticeById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notice ID",
      });
    }

    const notice = await Notice.findById(id)
      .populate("course", "name code")
      .populate("createdBy", "name email")
      .lean();

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    const role = req.user!.role;

    const allowed = await canViewNotice(
      notice,
      req.user!.id,
      role as "admin" | "student" | "teacher"
    );

    if (!allowed) {
      return res.status(403).json({
        message: "You are not allowed to view this notice",
      });
    }

    return res.status(200).json({ notice });
  } catch (error) {
    console.error("Get notice by ID error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Update a notice (admin only)
export const updateNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, audience, course, isPublic } = req.body;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    if (title !== undefined) {
      if (
        !isValidString(title) ||
        title.trim().length > MAX_TITLE_LENGTH
      ) {
        return res.status(400).json({
          message: `Title must not exceed ${MAX_TITLE_LENGTH} characters`,
        });
      }

      notice.title = title.trim();
    }

    if (content !== undefined) {
      if (
        !isValidString(content) ||
        content.trim().length > MAX_CONTENT_LENGTH
      ) {
        return res.status(400).json({
          message: `Content must not exceed ${MAX_CONTENT_LENGTH} characters`,
        });
      }

      notice.content = content.trim();
    }

    if (audience !== undefined) {
      if (!isValidAudience(audience)) {
        return res.status(400).json({
          message: "Invalid notice audience",
        });
      }

      notice.audience = audience;
    }

    if (isPublic !== undefined) {
      if (!isValidOptionalBoolean(isPublic)) {
        return res.status(400).json({
          message: "isPublic must be a boolean",
        });
      }

      notice.isPublic = isPublic;
    }

    if (course !== undefined) {
      if (course === null || course === "") {
        notice.course = undefined;
      } else {
        if (!isValidObjectId(course)) {
          return res.status(400).json({
            message: "Invalid course ID",
          });
        }

        const existingCourse = await Course.findById(course).select("_id");

        if (!existingCourse) {
          return res.status(404).json({
            message: "Course not found",
          });
        }

        notice.course = new mongoose.Types.ObjectId(course);
      }
    }

    // Enforce public notice restrictions after applying updates.
    if (
      notice.isPublic &&
      (notice.audience !== "all" || notice.course)
    ) {
      return res.status(400).json({
        message:
          'Public notices must have audience "all" and cannot target a specific course',
      });
    }

    await notice.save();

    return res.status(200).json({
      message: "Notice updated successfully",
      notice,
    });
  } catch (error) {
    console.error("Update notice error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete a notice (admin only)
export const deleteNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    await notice.deleteOne();

    return res.status(200).json({
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
