import { Router } from "express";

import {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  createTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  createSubjectAssignment,
  getSubjectAssignments,
  deleteSubjectAssignment,
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/admin.controller";

import {
  createCourseSchema,
  updateCourseSchema,
} from "../validators/course.validator";

import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../validators/subject.validator";

import {
  createStudentSchema,
  updateStudentSchema,
} from "../validators/admin-student.validator";

import {
  createTeacherSchema,
  updateTeacherSchema,
} from "../validators/teacher.validator";

import { createSubjectAssignmentSchema } from "../validators/subject-assignment.validator";
import { validate } from "../middleware/validate.middleware";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validateObjectId } from "../middleware/validateObjectId.middleware";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();



router.get(
  "/students",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  getAllStudents
);

router.post(
  "/students",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validate(createStudentSchema),
  createStudent
);

router.put(
  "/students/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  validate(updateStudentSchema),
  updateStudent
);

router.delete(
  "/students/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  deleteStudent
);


router.get(
  "/teachers",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  getAllTeachers
);

router.post(
  "/teachers",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validate(createTeacherSchema),
  createTeacher
);

router.put(
  "/teachers/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  validate(updateTeacherSchema),
  updateTeacher
);

router.delete(
  "/teachers/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  deleteTeacher
);


router.get(
  "/subject-assignments",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  getSubjectAssignments
);

router.post(
  "/subject-assignments",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validate(createSubjectAssignmentSchema),
  createSubjectAssignment
);

router.delete(
  "/subject-assignments/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  deleteSubjectAssignment
);

router.post(
  "/courses",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validate(createCourseSchema),
  createCourse
);

router.get(
  "/courses",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  getAllCourses
);

router.put(
  "/courses/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  validate(updateCourseSchema),
  updateCourse
);

router.delete(
  "/courses/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  deleteCourse
);

router.post(
  "/subjects",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validate(createSubjectSchema),
  createSubject
);

router.get(
  "/subjects",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  getAllSubjects
);

router.put(
  "/subjects/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  validate(updateSubjectSchema),
  updateSubject
);

router.delete(
  "/subjects/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("admin"),
  validateObjectId("id"),
  deleteSubject
);

export default router;