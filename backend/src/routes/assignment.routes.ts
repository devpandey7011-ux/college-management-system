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

const router = Router();

router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  validate(createAssignmentSchema),
  createAssignment
);



router.get(
  "/my-assignments",
  protect,
  authorizeRoles("student"),
  getMyAssignments
);

router.post(
  "/:id/submit",
  protect,
  authorizeRoles("student"),
  validateObjectId("id"),
  validate(submitAssignmentSchema),
  submitAssignment
);

router.get(
  "/:id/submissions",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  getAssignmentSubmissions
);

router.put(
  "/submissions/:submissionId/grade",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("submissionId"),
  validate(gradeAssignmentSubmissionSchema),
  gradeAssignmentSubmission
);
router.get(
  "/:id/my-submission",
  protect,
  authorizeRoles("student"),
  validateObjectId("id"),
  getMySubmission
);

router.get(
  "/my-created",
  protect,
  authorizeRoles("teacher"),
  getMyTeacherAssignments
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  deleteAssignment
);

router.put(
  "/:id",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  validate(updateAssignmentSchema),
  updateAssignment
);

router.get(
  "/:id/statistics",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  getAssignmentStatistics
);

export default router;