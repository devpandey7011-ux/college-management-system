import mongoose, { Document, Schema } from "mongoose";

export interface ITeacher extends Document {
  user: mongoose.Types.ObjectId;
  teacherId: string;
  department: string;
  designation: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    teacherId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model<ITeacher>("Teacher", teacherSchema);

export default Teacher;