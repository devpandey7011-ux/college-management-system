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

const router = Router();

// Teacher
router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  validate(createAttendanceSchema),
  createAttendance
);

router.put(
  "/:id",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  validate(updateAttendanceSchema),
  updateAttendance
);

// Student
router.get(
  "/my-attendance",
  protect,
  authorizeRoles("student"),
  getStudentAttendance
);

router.get(
  "/my-summary",
  protect,
  authorizeRoles("student"),
  getStudentAttendanceSummary
);

export default router;