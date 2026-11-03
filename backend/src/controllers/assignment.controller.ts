import { Response } from "express";
import Assignment from "../models/Assignment.model";
import SubjectAssignment from "../models/SubjectAssignment.model";
import AssignmentSubmission from "../models/AssignmentSubmission.model";
import Teacher from "../models/Teacher.model";
import Subject from "../models/Subject.model";
import Student from "../models/Student.model";
import Course from "../models/Course.model";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";


export const createAssignment = async (
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
      title,
      description,
      subject,
      course,
      dueDate,
      maxMarks,
    } = req.body;

    // Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !subject ||
      !course ||
      !dueDate ||
      maxMarks === undefined
    ) {
      return res.status(400).json({
        message:
          "Title, description, subject, course, due date and max marks are required",
      });
    }

    // Validate subject and course IDs
    if (
      typeof subject !== "string" ||
      !mongoose.isValidObjectId(subject) ||
      typeof course !== "string" ||
      !mongoose.isValidObjectId(course)
    ) {
      return res.status(400).json({
        message: "Invalid subject or course ID",
      });
    }

    const teacherObjectId =
      new mongoose.Types.ObjectId(
        String(req.user.id)
      );

    const subjectObjectId =
      new mongoose.Types.ObjectId(subject);

    const courseObjectId =
      new mongoose.Types.ObjectId(course);

    const teacher = await Teacher.findOne({
      user: teacherObjectId,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    // Validate max marks
    if (
      typeof maxMarks !== "number" ||
      !Number.isInteger(maxMarks) ||
      maxMarks <= 0 ||
      maxMarks > 1000
    ) {
      return res.status(400).json({
        message:
          "Max marks must be an integer between 1 and 1000",
      });
    }

    // Find subject
    const subjectDoc =
      await Subject.findById(subjectObjectId);

    if (!subjectDoc) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Find course
    const courseDoc =
      await Course.findById(courseObjectId);

    if (!courseDoc) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Make sure the subject belongs to the selected course
    if (
      subjectDoc.courseId.toString() !==
      courseDoc._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Subject does not belong to the selected course",
      });
    }

    // Teacher must be assigned to this exact subject and course
    const subjectAssignment =
      await SubjectAssignment.findOne({
        teacher: teacher._id,
        subject: subjectDoc._id,
        course: courseDoc._id,
      });

    if (!subjectAssignment) {
      return res.status(403).json({
        message:
          "You are not assigned to this subject and course",
      });
    }

    // Validate due date
    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    if (parsedDueDate <= new Date()) {
      return res.status(400).json({
        message: "Due date must be in the future",
      });
    }

    // Create assignment
    const newAssignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      subject: subjectDoc._id,
      course: courseDoc._id,
      teacher: teacher._id,
      dueDate: parsedDueDate,
      maxMarks,
    });

    // Populate response
    const populatedAssignment =
      await Assignment.findById(
        newAssignment._id
      )
        .populate(
          "subject",
          "name code semester credits"
        )
        .populate(
          "course",
          "name code"
        )
        .populate(
          "teacher",
          "teacherId department designation"
        );

    return res.status(201).json({
      message:
        "Assignment created successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const getMyAssignments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const student = await Student.findOne({
      userId: req.user.id,
    }).select(
      "course semester"
    );

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // Resolve the student's course code
    // to the Course document.
    const course = await Course.findOne({
      code: student.course.toUpperCase(),
    }).select("_id code");

    if (!course) {
      return res.status(404).json({
        message: "Student course not found",
      });
    }

    /*
     * Find subjects belonging to the student's
     * course and semester.
     */
    const subjects = await Subject.find({
      courseId: course._id,
      semester: student.semester,
    }).select("_id");

    const subjectIds = subjects.map(
      (subject) => subject._id
    );

    /*
     * Only return assignments that belong to:
     * 1. The student's course
     * 2. A subject in the student's semester
     */
    const assignments =
      await Assignment.find({
        course: course._id,
        subject: {
          $in: subjectIds,
        },
      })
        .populate(
          "subject",
          "name code semester credits"
        )
        .populate(
          "course",
          "name code"
        )
        .populate(
          "teacher",
          "teacherId department designation"
        )
        .sort({
          dueDate: 1,
        })
        .lean();

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(
      "Get student assignments error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const submitAssignment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const {
      submissionText,
      fileUrl,
    } = req.body;

    // Validate submission text type
    if (
      submissionText !== undefined &&
      typeof submissionText !== "string"
    ) {
      return res.status(400).json({
        message: "Submission text must be a string",
      });
    }

    // Validate file URL type
    if (
      fileUrl !== undefined &&
      typeof fileUrl !== "string"
    ) {
      return res.status(400).json({
        message: "File URL must be a string",
      });
    }

    // Trim submission text
    const trimmedSubmissionText =
      typeof submissionText === "string"
        ? submissionText.trim()
        : undefined;

    // Validate submission text length
    if (
      trimmedSubmissionText !== undefined &&
      trimmedSubmissionText.length > 10000
    ) {
      return res.status(400).json({
        message:
          "Submission text cannot exceed 10000 characters",
      });
    }

    // Validate file URL
    if (fileUrl !== undefined) {
      const trimmedFileUrl = fileUrl.trim();

      if (!trimmedFileUrl) {
        return res.status(400).json({
          message: "File URL cannot be empty",
        });
      }

      if (trimmedFileUrl.length > 2048) {
        return res.status(400).json({
          message:
            "File URL cannot exceed 2048 characters",
        });
      }

      try {
        const parsedUrl = new URL(trimmedFileUrl);

        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          return res.status(400).json({
            message:
              "File URL must use HTTP or HTTPS",
          });
        }
      } catch {
        return res.status(400).json({
          message: "Invalid file URL",
        });
      }
    }

    // Require at least one submission method
    if (
      !trimmedSubmissionText &&
      !fileUrl?.trim()
    ) {
      return res.status(400).json({
        message:
          "Submission text or file URL is required",
      });
    }

    const assignment =
      await Assignment.findById(
        req.params.id
      ).populate(
        "subject",
        "name code semester credits courseId"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Resolve the student's course code
    // to the Course document.
    const course = await Course.findOne({
      code: student.course.toUpperCase(),
    });

    if (!course) {
      return res.status(404).json({
        message: "Student course not found",
      });
    }

    // Make sure the student belongs
    // to the assignment's course.
    if (
      assignment.course.toString() !==
      course._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You cannot submit this assignment",
      });
    }

    // Make sure the assignment has a valid subject.
    const subject =
      assignment.subject as unknown as {
        semester: number;
        courseId?: unknown;
      };

    if (!subject) {
      return res.status(500).json({
        message:
          "Assignment subject data is invalid",
      });
    }

    // Make sure the subject has a valid semester.
    if (
      typeof subject.semester !== "number"
    ) {
      return res.status(500).json({
        message:
          "Assignment subject data is invalid",
      });
    }

    // Make sure the assignment belongs
    // to the student's semester.
    if (
      subject.semester !==
      student.semester
    ) {
      return res.status(403).json({
        message:
          "You cannot submit this assignment",
      });
    }

    // Make sure the subject belongs
    // to the same course as the assignment.
    if (
      subject.courseId &&
      subject.courseId.toString() !==
        course._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You cannot submit this assignment",
      });
    }

    // Prevent duplicate submissions.
    const existingSubmission =
      await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: student._id,
      });

    if (existingSubmission) {
      return res.status(409).json({
        message:
          "You have already submitted this assignment",
      });
    }

    const submittedAt = new Date();

    const status =
      submittedAt > assignment.dueDate
        ? "late"
        : "submitted";

    const submission =
      await AssignmentSubmission.create({
        assignment: assignment._id,
        student: student._id,
        submissionText:
          trimmedSubmissionText,
        fileUrl: fileUrl?.trim(),
        submittedAt,
        status,
      });

    const populatedSubmission =
      await AssignmentSubmission.findById(
        submission._id
      )
        .populate(
          "assignment",
          "title dueDate maxMarks"
        )
        .populate(
          "student",
          "enrollmentNumber course semester"
        );

    return res.status(201).json({
      message:
        "Assignment submitted successfully",
      submission:
        populatedSubmission,
    });
  } catch (error) {
    console.error(
      "Submit assignment error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAssignmentSubmissions = async (
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

    const assignment =
      await Assignment.findById(req.params.id).populate(
        "subject",
        "name code semester credits courseId"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Only the teacher who created the assignment
    // can view its submissions.
    if (
      assignment.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to view these submissions",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Assignment course not found",
      });
    }

    const subject =
      assignment.subject as unknown as {
        semester: number;
        courseId?: unknown;
      };

    if (
      !subject ||
      typeof subject.semester !== "number"
    ) {
      return res.status(500).json({
        message:
          "Assignment subject semester could not be determined",
      });
    }

    // Make sure the assignment subject belongs
    // to the same course as the assignment.
    if (
      subject.courseId &&
      subject.courseId.toString() !==
        course._id.toString()
    ) {
      return res.status(500).json({
        message:
          "Assignment subject does not belong to the assignment course",
      });
    }

    /*
     * Pagination
     *
     * Default:
     * page = 1
     * limit = 20
     *
     * Maximum:
     * limit = 100
     */
    const parsedPage = Number(req.query.page);
    const parsedLimit = Number(req.query.limit);

    const page =
      Number.isInteger(parsedPage) &&
      parsedPage >= 1
        ? parsedPage
        : 1;

    const limit =
      Number.isInteger(parsedLimit) &&
      parsedLimit >= 1 &&
      parsedLimit <= 100
        ? parsedLimit
        : 20;

    const skip = (page - 1) * limit;

    /*
     * Find students who currently belong to the
     * assignment's course and semester.
     */
    const students = await Student.find({
      course: course.code,
      semester: subject.semester,
    }).select("_id");

    const studentIds = students.map(
      (student) => student._id
    );

    /*
     * Count total submissions before pagination.
     */
    const totalSubmissions =
      await AssignmentSubmission.countDocuments({
        assignment: assignment._id,
        student: {
          $in: studentIds,
        },
      });

    /*
     * Query only submissions belonging to valid
     * students and apply pagination in MongoDB.
     */
    const submissions =
      await AssignmentSubmission.find({
        assignment: assignment._id,
        student: {
          $in: studentIds,
        },
      })
        .populate(
          "student",
          "enrollmentNumber course semester"
        )
        .sort({ submittedAt: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const totalPages =
      Math.ceil(totalSubmissions / limit);

    return res.status(200).json({
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        maxMarks: assignment.maxMarks,
      },
      pagination: {
        page,
        limit,
        totalSubmissions,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
      submissions,
    });
  } catch (error) {
    console.error(
      "Get assignment submissions error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const gradeAssignmentSubmission = async (
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

    const submission =
      await AssignmentSubmission.findById(
        req.params.submissionId
      );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const assignment =
      await Assignment.findById(
        submission.assignment
      ).populate(
        "subject",
        "name code semester credits"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Only the teacher who created the assignment
    // can grade its submissions.
    if (
      assignment.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to grade this submission",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Assignment course not found",
      });
    }

    const subject =
      assignment.subject as unknown as {
        semester: number;
      };

    if (
      !subject ||
      typeof subject.semester !== "number"
    ) {
      return res.status(500).json({
        message:
          "Assignment subject semester could not be determined",
      });
    }

    /*
     * Verify that the submitted student still belongs
     * to the assignment's course and semester.
     */
    const student = await Student.findById(
      submission.student
    );

    if (!student) {
      return res.status(404).json({
        message: "Submission student not found",
      });
    }

    if (
      student.course?.toUpperCase() !==
        course.code.toUpperCase() ||
      student.semester !== subject.semester
    ) {
      return res.status(403).json({
        message:
          "This submission does not belong to the assignment's course and semester",
      });
    }

    const {
      marksObtained,
      feedback,
    } = req.body;

    // Validate marks presence.
    if (marksObtained === undefined) {
      return res.status(400).json({
        message: "Marks obtained are required",
      });
    }

    // Do not silently accept arbitrary strings,
    // booleans, arrays, etc.
    if (
      typeof marksObtained !== "number" ||
      !Number.isFinite(marksObtained)
    ) {
      return res.status(400).json({
        message:
          "Marks obtained must be a valid number",
      });
    }

    // Prevent negative marks.
    if (marksObtained < 0) {
      return res.status(400).json({
        message:
          "Marks obtained cannot be negative",
      });
    }

    // Prevent marks above the assignment maximum.
    if (
      marksObtained > assignment.maxMarks
    ) {
      return res.status(400).json({
        message:
          `Marks cannot exceed ${assignment.maxMarks}`,
      });
    }

    // Validate feedback if supplied.
    if (
      feedback !== undefined &&
      typeof feedback !== "string"
    ) {
      return res.status(400).json({
        message: "Feedback must be a string",
      });
    }

    const trimmedFeedback =
      typeof feedback === "string"
        ? feedback.trim()
        : undefined;

    // Prevent excessively large feedback payloads.
    if (
      trimmedFeedback !== undefined &&
      trimmedFeedback.length > 2000
    ) {
      return res.status(400).json({
        message:
          "Feedback cannot exceed 2000 characters",
      });
    }

    submission.marksObtained =
      marksObtained;

    if (trimmedFeedback !== undefined) {
      submission.feedback =
        trimmedFeedback;
    }

    await submission.save();

    const populatedSubmission =
      await AssignmentSubmission.findById(
        submission._id
      )
        .populate(
          "assignment",
          "title dueDate maxMarks"
        )
        .populate(
          "student",
          "enrollmentNumber course semester"
        );

    return res.status(200).json({
      message:
        "Assignment graded successfully",
      submission:
        populatedSubmission,
    });
  } catch (error) {
    console.error(
      "Grade assignment submission error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMySubmission = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const student = await Student.findOne({
      userId: req.user.id,
    }).select("course semester");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const assignment =
      await Assignment.findById(
        req.params.id
      ).populate(
        "subject",
        "name code semester credits courseId"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findOne({
      code: student.course.toUpperCase(),
    }).select("_id code");

    if (!course) {
      return res.status(404).json({
        message: "Student course not found",
      });
    }

    // Make sure the assignment belongs
    // to the student's course.
    if (
      assignment.course.toString() !==
      course._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot view this assignment",
      });
    }

    const subject =
      assignment.subject as unknown as {
        semester: number;
        courseId?: {
          toString: () => string;
        };
      };

    if (
      !subject ||
      typeof subject.semester !== "number"
    ) {
      return res.status(500).json({
        message:
          "Assignment subject semester could not be determined",
      });
    }

    // Make sure the assignment belongs
    // to the student's semester.
    if (
      subject.semester !==
      student.semester
    ) {
      return res.status(403).json({
        message: "You cannot view this assignment",
      });
    }

    /*
     * Make sure the subject itself belongs
     * to the assignment's course.
     */
    if (
      subject.courseId &&
      subject.courseId.toString() !==
        course._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot view this assignment",
      });
    }

    /*
     * Most important ownership check:
     * only this authenticated student's
     * submission can ever be returned.
     */
    const submission =
      await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: student._id,
      })
        .populate(
          "assignment",
          "title description dueDate maxMarks"
        )
        .populate(
          "student",
          "enrollmentNumber course semester"
        )
        .lean();

    if (!submission) {
      return res.status(404).json({
        message:
          "You have not submitted this assignment",
      });
    }

    return res.status(200).json({
      submission,
    });
  } catch (error) {
    console.error(
      "Get my submission error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMyTeacherAssignments = async (
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
    }).select("_id");

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    const assignments = await Assignment.find({
      teacher: teacher._id,
    })
      .select(
        "title description subject course teacher dueDate maxMarks createdAt updatedAt"
      )
      .populate(
        "subject",
        "name code semester credits"
      )
      .populate(
        "course",
        "name code"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(
      "Get teacher assignments error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteAssignment = async (
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

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Only the teacher who created it can delete it
    if (assignment.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own assignments",
      });
    }

    // Prevent deletion if students have already submitted
    const submissionCount = await AssignmentSubmission.countDocuments({
      assignment: assignment._id,
    });

    if (submissionCount > 0) {
       return res.status(409).json({
      message: "Cannot delete an assignment that has submissions",
      dependencies: {
        submissions: submissionCount,
      },
    });
    }

    const deletedAssignment =
      await Assignment.findOneAndDelete({
        _id: assignment._id,
      });

    if (!deletedAssignment) {
      return res.status(404).json({
        message: "Assignment no longer exists",
      });
    }
    return res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const updateAssignment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const teacherObjectId =
      new mongoose.Types.ObjectId(
        String(req.user.id)
      );

    const teacher = await Teacher.findOne({
      user: teacherObjectId,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    // Validate assignment ID before querying.
    const assignmentId = String(req.params.id);

    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    const assignmentObjectId =
      new mongoose.Types.ObjectId(assignmentId);

    const assignment =
      await Assignment.findById(assignmentObjectId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Only the teacher who created it can update it
    if (
      assignment.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only update your own assignments",
      });
    }

    const {
      title,
      description,
      dueDate,
      maxMarks,
    } = req.body;

    // Validate title
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      assignment.title = title.trim();
    }

    // Validate description
    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim()
      ) {
        return res.status(400).json({
          message: "Description cannot be empty",
        });
      }

      assignment.description =
        description.trim();
    }

    // Validate due date
    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);

      if (
        Number.isNaN(parsedDueDate.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }

      if (parsedDueDate <= new Date()) {
        return res.status(400).json({
          message:
            "Due date must be in the future",
        });
      }

      assignment.dueDate = parsedDueDate;
    }

    // Validate max marks
    if (maxMarks !== undefined) {
      // Do not allow max marks to change
      // after students have submitted.
      const submissionCount =
        await AssignmentSubmission.countDocuments({
          assignment: assignment._id,
        });

      if (submissionCount > 0) {
        return res.status(409).json({
          message:
            "Cannot change max marks because students have already submitted this assignment",
          dependencies: {
            submissions: submissionCount,
          },
        });
      }

      if (
        typeof maxMarks !== "number" ||
        !Number.isInteger(maxMarks) ||
        maxMarks <= 0 ||
        maxMarks > 1000
      ) {
        return res.status(400).json({
          message:
            "Max marks must be an integer between 1 and 1000",
        });
      }

      assignment.maxMarks = maxMarks;
    }

    await assignment.save();

    const updatedAssignment =
      await Assignment.findById(
        assignment._id
      )
        .populate(
          "subject",
          "name code semester credits"
        )
        .populate(
          "course",
          "name code"
        )
        .populate(
          "teacher",
          "teacherId department designation"
        );

    return res.status(200).json({
      message:
        "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error(
      "Update assignment error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const getAssignmentStatistics = async (
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

    const assignment =
      await Assignment.findById(
        req.params.id
      ).populate(
        "subject",
        "name code semester credits courseId"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Only the teacher who created the assignment
    // can view its statistics.
    if (
      assignment.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only view statistics for your own assignments",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message:
          "Assignment course not found",
      });
    }

    const subject =
      assignment.subject as unknown as {
        semester: number;
        courseId?: unknown;
      };

    if (
      !subject ||
      typeof subject.semester !== "number"
    ) {
      return res.status(500).json({
        message:
          "Assignment subject semester could not be determined",
      });
    }

    // Make sure the assignment subject belongs
    // to the same course as the assignment.
    if (
      subject.courseId &&
      subject.courseId.toString() !==
        course._id.toString()
    ) {
      return res.status(500).json({
        message:
          "Assignment subject does not belong to the assignment course",
      });
    }

    /*
     * Find students who currently belong to the
     * assignment's course and semester.
     */
    const students = await Student.find({
      course: course.code,
      semester: subject.semester,
    }).select("_id");

    const studentIds = students.map(
      (student) => student._id
    );

    const totalStudents =
      studentIds.length;

    /*
     * Aggregate submission statistics in MongoDB
     * instead of loading every submission into
     * application memory.
     */
    const aggregationResult =
      await AssignmentSubmission.aggregate([
        {
          $match: {
            assignment: assignment._id,
            student: {
              $in: studentIds,
            },
          },
        },
        {
          $group: {
            _id: null,
            submitted: {
              $sum: 1,
            },
            graded: {
              $sum: {
                $cond: [
                  {
                    $ne: [
                      {
                        $ifNull: [
                          "$marksObtained",
                          null,
                        ],
                      },
                      null,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalMarks: {
              $sum: {
                $cond: [
                  {
                    $ne: [
                      {
                        $ifNull: [
                          "$marksObtained",
                          null,
                        ],
                      },
                      null,
                    ],
                  },
                  "$marksObtained",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const result =
      aggregationResult[0] ?? {
        submitted: 0,
        graded: 0,
        totalMarks: 0,
      };

    const submitted =
      result.submitted;

    const graded =
      result.graded;

    const pending = Math.max(
      totalStudents - submitted,
      0
    );

    const ungraded = Math.max(
      submitted - graded,
      0
    );

    const averageMarks =
      graded > 0
        ? Number(
            (
              result.totalMarks /
              graded
            ).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      assignment: {
        id: assignment._id,
        title: assignment.title,
        maxMarks: assignment.maxMarks,
        dueDate: assignment.dueDate,
      },
      statistics: {
        totalStudents,
        submitted,
        pending,
        graded,
        ungraded,
        averageMarks,
      },
    });
  } catch (error) {
    console.error(
      "Get assignment statistics error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};