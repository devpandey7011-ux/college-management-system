import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const requestRegisterOtpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const verifyRegisterOtpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address"),
});

export const verifyResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const resetPasswordSchema = z.object({
  resetToken: z
    .string()
    .min(1, "Reset token is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});