
import mongoose, { Document, Schema } from "mongoose";

export type NoticeAudience = "all" | "students" | "teachers";

export interface INotice extends Document {
  title: string;
  content: string;
  audience: NoticeAudience;
  isPublic: boolean;
  course?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    audience: {
      type: String,
      enum: ["all", "students", "teachers"],
      default: "all",
      required: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ audience: 1, course: 1, createdAt: -1 });

const Notice = mongoose.model<INotice>("Notice", noticeSchema);

export default Notice;
