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
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.get("/", apiRateLimiter, protect, getSubjects);

router.get("/:id", apiRateLimiter, protect, getSubjectById);

router.post(
  "/",
  apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  createSubject
);

router.put(
  "/:id",
  apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  updateSubject
);

router.delete(
  "/:id",
  apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  deleteSubject
);
export default router;