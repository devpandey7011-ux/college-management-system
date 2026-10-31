import mongoose, { Document, Schema } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  subject: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  maxMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ teacher: 1, createdAt: -1 });
assignmentSchema.index({
  teacher: 1,
  subject: 1,
  createdAt: -1,
});

assignmentSchema.index({
  course: 1,
  dueDate: 1,
});

const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema
);

export default Assignment;