import { Router } from "express";

import {
  loginUser,
  getMe,
  requestRegisterOtp,
  verifyRegisterOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/auth.controller";

import {
  loginSchema,
  
  requestRegisterOtpSchema,
  verifyRegisterOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

import {
  loginRateLimiter,
  otpRequestRateLimiter,
} from "../middleware/rateLimit.middleware";

import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";


const router = Router();


router.post(
  "/register/request-otp",
  otpRequestRateLimiter,
  validate(requestRegisterOtpSchema),
  requestRegisterOtp
);

router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  verifyResetOtp
);

router.post(
  "/forgot-password",
  otpRequestRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  loginUser
);

router.post(
  "/register/verify-otp",
  validate(verifyRegisterOtpSchema),
  verifyRegisterOtp
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);

router.get("/me", protect, getMe);

export default router;