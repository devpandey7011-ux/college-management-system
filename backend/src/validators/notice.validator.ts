
import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),

  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(5000, "Content cannot exceed 5000 characters"),

  audience: z
    .enum(["all", "students", "teachers"], {
      message: "Invalid notice audience",
    })
    .optional(),

  course: z
    .string()
    .min(1, "Course ID cannot be empty")
    .optional(),

  isPublic: z.boolean().optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();
