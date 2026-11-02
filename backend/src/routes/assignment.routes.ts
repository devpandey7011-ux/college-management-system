import { Router } from "express";
import {
  createAssignment,
  getMyAssignments,
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
  getMySubmission,
  getMyTeacherAssignments,
  deleteAssignment,
  updateAssignment,
  getAssignmentStatistics,
} from "../controllers/assignment.controller";

import { validate } from "../middleware/validate.middleware";

import {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeAssignmentSubmissionSchema,
} from "../validators/assignment.validator";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

import { validateObjectId } from "../middleware/validateObjectId.middleware";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post(
  "/",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validate(createAssignmentSchema),
  createAssignment
);



router.get(
  "/my-assignments",
 apiRateLimiter,
  protect,
  authorizeRoles("student"),
  getMyAssignments
);

router.post(
  "/:id/submit",
 apiRateLimiter,
  protect,
  authorizeRoles("student"),
  validateObjectId("id"),
  validate(submitAssignmentSchema),
  submitAssignment
);

router.get(
  "/:id/submissions",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  getAssignmentSubmissions
);

router.put(
  "/submissions/:submissionId/grade",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("submissionId"),
  validate(gradeAssignmentSubmissionSchema),
  gradeAssignmentSubmission
);
router.get(
  "/:id/my-submission",
 apiRateLimiter,
  protect,
  authorizeRoles("student"),
  validateObjectId("id"),
  getMySubmission
);

router.get(
  "/my-created",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  getMyTeacherAssignments
);

router.delete(
  "/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  deleteAssignment
);

router.put(
  "/:id",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  validate(updateAssignmentSchema),
  updateAssignment
);

router.get(
  "/:id/statistics",
 apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  getAssignmentStatistics
);

export default router;