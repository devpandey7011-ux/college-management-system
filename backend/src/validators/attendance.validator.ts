import { z } from "zod";

export const createAttendanceSchema = z.object({
  student: z
    .string()
    .min(1, "Student ID is required"),

  subject: z
    .string()
    .min(1, "Subject ID is required"),

  date: z
    .string()
    .min(1, "Date is required")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Invalid date"
    ),

  status: z
    .enum(["present", "absent", "late"], {
      message: "Invalid attendance status",
    }),

  remarks: z
    .string()
    .trim()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
});

export const updateAttendanceSchema = z.object({
  status: z
    .enum(["present", "absent", "late"], {
      message: "Invalid attendance status",
    })
    .optional(),

  remarks: z
    .string()
    .trim()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
});