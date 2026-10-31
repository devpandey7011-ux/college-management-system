import mongoose, { Document, Schema } from "mongoose";

export type ExamType = "internal" | "midterm" | "final";

export interface IResult extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  examType: ExamType;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resultSchema = new Schema<IResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    examType: {
      type: String,
      enum: ["internal", "midterm", "final"],
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    grade: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// A student should have only one result
// for a particular subject and exam type.
resultSchema.index(
  {
    student: 1,
    subject: 1,
    examType: 1,
  },
  {
    unique: true,
  }
);

const Result = mongoose.model<IResult>("Result", resultSchema);

export default Result;