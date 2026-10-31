import mongoose, { Document, Schema } from "mongoose";

export type OtpPurpose = "register" | "reset-password";

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["register", "reset-password"],
      required: true,
    },

   expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired OTP documents
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Otp = mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;