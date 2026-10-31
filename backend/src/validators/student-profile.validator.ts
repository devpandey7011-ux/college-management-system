import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),

  dateOfBirth: z
    .string()
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Invalid date of birth"
    )
    .optional(),
});