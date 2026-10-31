import mongoose, { Document, Schema } from "mongoose";

export interface ISubjectAssignment extends Document {
  teacher: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subjectAssignmentSchema = new Schema<ISubjectAssignment>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
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
  },
  { timestamps: true }
);

subjectAssignmentSchema.index(
  { teacher: 1, subject: 1 },
  { unique: true }
);

const SubjectAssignment = mongoose.model<ISubjectAssignment>(
  "SubjectAssignment",
  subjectAssignmentSchema
);


export default SubjectAssignment;