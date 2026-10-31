import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    "Invalid Course ID"
  );

export const createSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code must not exceed 20 characters"),

  courseId: objectIdSchema,

  semester: z
    .number()
    .int("Semester must be an integer")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester cannot exceed 12"),

  credits: z
    .number()
    .int("Credits must be an integer")
    .min(1, "Credits must be at least 1")
    .max(10, "Credits cannot exceed 10"),
});

export const updateSubjectSchema =
  createSubjectSchema.partial();