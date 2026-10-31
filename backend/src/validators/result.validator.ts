import { z } from "zod";

export const createResultSchema = z.object({
  student: z
    .string()
    .min(1, "Student ID is required"),

  subject: z
    .string()
    .min(1, "Subject ID is required"),

  examType: z
    .enum(["internal", "midterm", "final"], {
      message: "Invalid exam type",
    }),

  marksObtained: z
    .number()
    .min(0, "Marks obtained cannot be negative"),

  maxMarks: z
    .number()
    .min(1, "Maximum marks must be at least 1"),

  remarks: z
    .string()
    .trim()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
});

export const updateResultSchema = z.object({
  marksObtained: z
    .number()
    .min(0, "Marks obtained cannot be negative")
    .optional(),

  maxMarks: z
    .number()
    .min(1, "Maximum marks must be at least 1")
    .optional(),

  remarks: z
    .string()
    .trim()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
});