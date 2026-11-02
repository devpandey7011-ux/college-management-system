import { Router } from "express";
import {
  createAttendance,
  updateAttendance,
  getStudentAttendance,
  getStudentAttendanceSummary,
} from "../controllers/attendance.controller";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createAttendanceSchema,
  updateAttendanceSchema,
} from "../validators/attendance.validator";
import { validateObjectId } from "../middleware/validateObjectId.middleware";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Teacher
router.post(
  "/",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validate(createAttendanceSchema),
  createAttendance
);

router.put(
  "/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  validate(updateAttendanceSchema),
  updateAttendance
);

// Student
router.get(
  "/my-attendance",
 apiRateLimiter,
  protect,
  authorizeRoles("student"),
  getStudentAttendance
);

router.get(
  "/my-summary",
 apiRateLimiter,
  protect,
  authorizeRoles("student"),
  getStudentAttendanceSummary
);

export default router;