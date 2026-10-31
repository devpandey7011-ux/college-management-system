import mongoose, { Document, Schema } from "mongoose";

export type SubmissionStatus = "submitted" | "late";

export interface IAssignmentSubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  submissionText?: string;
  fileUrl?: string;
  submittedAt: Date;
  status: SubmissionStatus;
  marksObtained?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSubmissionSchema =
  new Schema<IAssignmentSubmission>(
    {
      assignment: {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
        required: true,
      },

      student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      submissionText: {
        type: String,
        trim: true,
        maxlength: 10000,
      },

      fileUrl: {
        type: String,
        trim: true,
      },

      submittedAt: {
        type: Date,
        required: true,
      },

      status: {
        type: String,
        enum: ["submitted", "late"],
        required: true,
      },

      marksObtained: {
        type: Number,
        min: 0,
      },

      feedback: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },
    { timestamps: true }
  );

assignmentSubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);

const AssignmentSubmission =
  mongoose.model<IAssignmentSubmission>(
    "AssignmentSubmission",
    assignmentSubmissionSchema
  );

export default AssignmentSubmission;