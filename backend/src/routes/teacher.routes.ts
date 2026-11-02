import { Router } from "express";

import {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherStudents,
  getTeacherSubjectAssignments,
} from "../controllers/teacher.controller";

import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";
const router = Router();

router.get(
  "/students",
  apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  getTeacherStudents
);

router.get(
  "/subject-assignments",
  apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  getTeacherSubjectAssignments
);

router.get(
  "/profile",
  apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  getTeacherProfile
);

router.put(
  "/profile",
  apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  updateTeacherProfile
);
export default router;