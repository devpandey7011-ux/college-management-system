import { z } from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Course name must be at least 2 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must not exceed 20 characters"),

  department: z
    .string()
    .trim()
    .min(2, "Department must be at least 2 characters"),

  totalSemesters: z
    .number()
    .int("Total semesters must be an integer")
    .min(1, "Total semesters must be at least 1")
    .max(12, "Total semesters cannot exceed 12"),
});

export const updateCourseSchema = createCourseSchema.partial();