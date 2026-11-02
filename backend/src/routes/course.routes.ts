import { Router } from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller";

import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Anyone authenticated can view courses
router.get(
  "/",
 apiRateLimiter,
  protect,
  getCourses
);

router.get(
  "/:id",
 apiRateLimiter,
  protect,
  getCourseById
);

// Only admin can manage courses
router.post(
  "/",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  createCourse
);

router.put(
  "/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  updateCourse
);

router.delete(
  "/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  deleteCourse
);

export default router;