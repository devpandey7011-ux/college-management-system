import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendOtpEmail = async (
  email: string,
  otp: string,
  purpose: "register" | "reset-password"
) => {
  const subject =
    purpose === "register"
      ? "Verify your College Management account"
      : "Reset your College Management password";

  const message =
    purpose === "register"
      ? `
        <h2>Email Verification</h2>
        <p>Your OTP for account verification is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
      : `
        <h2>Password Reset</h2>
        <p>Your OTP for resetting your password is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `;

 await transporter.sendMail({
  from: `"College Management System" <${process.env.EMAIL_USER}>`,
  to: email,
  subject,
  html: message,
});


};