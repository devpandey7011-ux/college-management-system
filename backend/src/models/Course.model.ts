import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  name: string;
  code: string;
  department: string;
  totalSemesters: number;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    totalSemesters: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;