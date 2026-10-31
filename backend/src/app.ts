
import dotenv from "dotenv";

dotenv.config();

import helmet from "helmet";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import courseRoutes from "./routes/course.routes";
import subjectRoutes from "./routes/subject.routes";
import assignmentRoutes from "./routes/assignment.routes";
import resultRoutes from "./routes/result.routes";
import attendanceRoutes from "./routes/attendance.routes";
import noticeRoutes from "./routes/notice.routes";
import adminRoutes from "./routes/admin.routes";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware";

const app = express();

app.use(helmet());

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is not configured");
}

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

// API routes
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (_req, res) => {
  return res.status(200).json({
    message: "College Management API is running",
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
