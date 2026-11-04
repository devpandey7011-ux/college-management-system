import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { generateToken, verifyToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";
import Otp from "../models/Otp.model";
import { generateOtp, hashOtp } from "../utils/otp";
import { sendOtpEmail } from "../utils/email";

const GENERIC_RESET_MESSAGE =
  "If an account exists with this email, a password reset OTP has been sent";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id.toString(), "auth");

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const requestRegisterOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await Otp.deleteMany({
      email: normalizedEmail,
      purpose: "register",
    });

    const otpRecord = await Otp.create({
      email: normalizedEmail,
      otpHash,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    });

    if (process.env.NODE_ENV !== "test") {
      try {
        await sendOtpEmail(
          normalizedEmail,
          otp,
          "register"
        );
      } catch (emailError) {
        await Otp.deleteOne({
          _id: otpRecord._id,
        });

        throw emailError;
      }
    }

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Request registration OTP error:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

export const verifyRegisterOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password, otp } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof otp !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !otp.trim()
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose: "register",
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or expired",
      });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        message: "Too many incorrect attempts",
      });
    }

    const providedOtpHash = hashOtp(otp);

    if (providedOtpHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(201).json({
      message:
        "Email verified and account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Verify registration OTP error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
     * Always return the same response for existing and
     * non-existing accounts to prevent email enumeration.
     */
    if (!user) {
      return res.status(200).json({
        message: GENERIC_RESET_MESSAGE,
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await Otp.deleteMany({
      email: normalizedEmail,
      purpose: "reset-password",
    });

    const otpRecord = await Otp.create({
      email: normalizedEmail,
      otpHash,
      purpose: "reset-password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    });

    /*
     * Automated tests must not depend on a real SMTP server.
     */
    if (process.env.NODE_ENV !== "test") {
      try {
        await sendOtpEmail(
          normalizedEmail,
          otp,
          "reset-password"
        );
      } catch (emailError) {
        await Otp.deleteOne({
          _id: otpRecord._id,
        });

        throw emailError;
      }
    }

    return res.status(200).json({
      message: GENERIC_RESET_MESSAGE,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Failed to send password reset OTP",
    });
  }
};

export const verifyResetOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose: "reset-password",
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or expired",
      });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        message: "Too many incorrect attempts",
      });
    }

    const hashedOtp = hashOtp(otp);

    if (hashedOtp !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

  
      const user = await User.findOne({
        email: normalizedEmail,
      }).select("+resetTokenVersion");


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    const resetToken = generateToken(
      user._id.toString(),
      "reset-password",
      user.resetTokenVersion ?? 0
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error(
      "Verify reset OTP error:",
      error
    );

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};


export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { resetToken, password } = req.body;

    if (
      typeof resetToken !== "string" ||
      typeof password !== "string" ||
      !resetToken.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    let decoded;

    try {
      decoded = verifyToken(resetToken);
    } catch {
      return res.status(401).json({
        message: "Invalid or expired reset token",
      });
    }

    if (
      decoded.type !== "reset-password" ||
      typeof decoded.resetTokenVersion !== "number"
    ) {
      return res.status(401).json({
        message: "Invalid reset token",
      });
    }

    const user = await User.findById(decoded.userId)
      .select("+resetTokenVersion");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentVersion = user.resetTokenVersion ?? 0;

    if (decoded.resetTokenVersion !== currentVersion) {
      return res.status(401).json({
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   
const versionFilter =
  currentVersion === 0
    ? {
        $or: [
          { resetTokenVersion: 0 },
          { resetTokenVersion: { $exists: false } },
        ],
      }
    : { resetTokenVersion: currentVersion };

const updatedUser = await User.findOneAndUpdate(
  {
    _id: user._id,
    ...versionFilter,
  },
  {
    $set: { password: hashedPassword },
    $inc: { resetTokenVersion: 1 },
  },
  {
    returnDocument: "after",
    runValidators: true,
  }
);


    if (!updatedUser) {
      return res.status(401).json({
        message: "Invalid or expired reset token",
      });
    }

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};
