import mongoose, { Document, Schema } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "late";

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
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

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
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

// Prevent duplicate attendance records
// for the same student, subject and date.
attendanceSchema.index(
  {
    student: 1,
    subject: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);

export default Attendance;