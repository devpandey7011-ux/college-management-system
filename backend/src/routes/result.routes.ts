import { Router } from "express";

import {
  createResult,
  updateResult,
  getStudentResults,
} from "../controllers/result.controller";

import {
  createResultSchema,
  updateResultSchema,
} from "../validators/result.validator";

import { validate } from "../middleware/validate.middleware";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validateObjectId } from "../middleware/validateObjectId.middleware";
import { apiRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Students can view their own results.
// Students can view their own results.
router.get(
  "/my-results",
  apiRateLimiter,
  protect,
  authorizeRoles("student"),
  getStudentResults
);

// Only teachers can upload results.
router.post(
  "/",
  apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validate(createResultSchema),
  createResult
);

router.put(
  "/:id",
  apiRateLimiter,
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  validate(updateResultSchema),
  updateResult
);

export default router;