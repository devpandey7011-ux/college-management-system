import { Router } from "express";

import {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherStudents,
  getTeacherSubjectAssignments,
} from "../controllers/teacher.controller";

import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/students",
  protect,
  authorizeRoles("teacher"),
  getTeacherStudents
);

router.get(
  "/subject-assignments",
  protect,
  authorizeRoles("teacher"),
  getTeacherSubjectAssignments
);

router.get(
  "/profile",
  protect,
  authorizeRoles("teacher"),
  getTeacherProfile
);

router.put(
  "/profile",
  protect,
  authorizeRoles("teacher"),
  updateTeacherProfile
);

export default router;