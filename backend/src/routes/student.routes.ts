import { Router } from "express";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/student.controller";

import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateStudentProfileSchema } from "../validators/student-profile.validator";

const router = Router();

router.get(
  "/profile",
  protect,
  authorizeRoles("student"),
  getStudentProfile
);

router.put(
  "/profile",
  protect,
  authorizeRoles("student"),
  validate(updateStudentProfileSchema),
  updateStudentProfile
);
export default router;