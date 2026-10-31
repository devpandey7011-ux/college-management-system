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

const router = Router();

// Anyone authenticated can view courses
router.get(
  "/",
  protect,
  getCourses
);

router.get(
  "/:id",
  protect,
  getCourseById
);

// Only admin can manage courses
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createCourse
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateCourse
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteCourse
);

export default router;