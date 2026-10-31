import { Router } from "express";

import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller";

import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Authenticated users can view subjects
router.get(
  "/",
  protect,
  getSubjects
);

router.get(
  "/:id",
  protect,
  getSubjectById
);

// Only admin can manage subjects
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSubject
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateSubject
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteSubject
);

export default router;