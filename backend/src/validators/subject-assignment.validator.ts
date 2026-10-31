import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    "Invalid ID"
  );

export const createSubjectAssignmentSchema = z.object({
  teacher: objectIdSchema,
  subject: objectIdSchema,
  course: objectIdSchema,
});