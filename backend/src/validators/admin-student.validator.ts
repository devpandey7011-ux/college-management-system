import { z } from "zod";

export const createStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  enrollmentNumber: z
    .string()
    .trim()
    .min(2, "Enrollment number must be at least 2 characters")
    .max(50, "Enrollment number must not exceed 50 characters"),

  course: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters"),

  semester: z
    .number()
    .int("Semester must be an integer")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester cannot exceed 12"),

  phone: z
    .string()
    .trim()
    .optional(),

  dateOfBirth: z
    .string()
    .optional(),
});

export const updateStudentSchema = createStudentSchema
  .omit({
    password: true,
  })
  .partial();