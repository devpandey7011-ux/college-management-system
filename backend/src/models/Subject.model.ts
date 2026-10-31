import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code: string;
  courseId: mongoose.Types.ObjectId;
  semester: number;
  credits: number;
}

const subjectSchema = new Schema<ISubject>(
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

    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model<ISubject>("Subject", subjectSchema);

export default Subject;