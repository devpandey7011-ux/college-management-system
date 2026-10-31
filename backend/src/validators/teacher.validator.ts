import { z } from "zod";

export const createTeacherSchema = z.object({
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

  teacherId: z
    .string()
    .trim()
    .min(2, "Teacher ID must be at least 2 characters")
    .max(50, "Teacher ID must not exceed 50 characters"),

  department: z
    .string()
    .trim()
    .min(2, "Department must be at least 2 characters"),

  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters"),

  phone: z
    .string()
    .trim()
    .optional(),
});

export const updateTeacherSchema = createTeacherSchema
  .omit({
    password: true,
  })
  .partial();