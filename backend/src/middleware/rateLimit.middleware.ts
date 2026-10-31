
import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

export const otpRequestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    message: "Too many OTP requests. Please try again later.",
  },
});
