import { z } from "zod";

export const createAssignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description cannot exceed 5000 characters"),

  subject: z
    .string()
    .min(1, "Subject ID is required"),

  course: z
    .string()
    .min(1, "Course ID is required"),

  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Invalid due date"
    )
    .refine(
      (value) => new Date(value) > new Date(),
      "Due date must be in the future"
    ),

  maxMarks: z
    .number()
    .positive("Max marks must be greater than 0")
    .max(1000, "Max marks cannot exceed 1000"),
});

export const updateAssignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, "Description cannot be empty")
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  dueDate: z
    .string()
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Invalid due date"
    )
    .refine(
      (value) => new Date(value) > new Date(),
      "Due date must be in the future"
    )
    .optional(),

  maxMarks: z
    .number()
    .positive("Max marks must be greater than 0")
    .max(1000, "Max marks cannot exceed 1000")
    .optional(),
});

export const submitAssignmentSchema = z
  .object({
    submissionText: z
      .string()
      .trim()
      .max(10000, "Submission text cannot exceed 10000 characters")
      .optional(),

    fileUrl: z
      .string()
      .trim()
      .url("Invalid file URL")
      .optional(),
  })
  .refine(
    (data) => !!data.submissionText || !!data.fileUrl,
    {
      message: "Submission text or file URL is required",
      path: ["submissionText"],
    }
  );

export const gradeAssignmentSubmissionSchema = z.object({
  marksObtained: z
    .number()
    .min(0, "Marks obtained cannot be negative"),

  feedback: z
    .string()
    .trim()
    .max(2000, "Feedback cannot exceed 2000 characters")
    .optional(),
});