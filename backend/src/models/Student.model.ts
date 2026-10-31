import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  enrollmentNumber: string;
  course: string;
  semester: number;
  phone?: string;
  dateOfBirth?: Date;
}


const studentSchema = new Schema<IStudent>(
  {
    
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    phone: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ course: 1, semester: 1 });

const Student = mongoose.model<IStudent>("Student", studentSchema);

export default Student;