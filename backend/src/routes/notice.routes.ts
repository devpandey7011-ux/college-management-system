import { Router } from "express";

import {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getPublicNotices,
} from "../controllers/notice.controller";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

import { validate } from "../middleware/validate.middleware";
import {
  createNoticeSchema,
  updateNoticeSchema,
} from "../validators/notice.validator";
import { validateObjectId } from "../middleware/validateObjectId.middleware";

const router = Router();

router.get("/public", getPublicNotices);

// Admin
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  validate(createNoticeSchema),
  createNotice
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  validate(updateNoticeSchema),
  updateNotice
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  deleteNotice
);

// Authenticated users
router.get(
  "/",
  protect,
  authorizeRoles("admin", "student", "teacher"),
  getNotices
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "student", "teacher"),
  validateObjectId("id"),
  getNoticeById
);

export default router;