import { Router } from "express";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/student.controller";

import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateStudentProfileSchema } from "../validators/student-profile.validator";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.get(
  "/profile",
  apiRateLimiter,
  protect,
  authorizeRoles("student"),
  getStudentProfile
);

router.put(
  "/profile",
  apiRateLimiter,
  protect,
  authorizeRoles("student"),
  validate(updateStudentProfileSchema),
  updateStudentProfile
);
export default router;