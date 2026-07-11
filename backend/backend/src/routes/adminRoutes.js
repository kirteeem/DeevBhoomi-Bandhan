import { Router } from "express";
import {
  getAnalytics, listUsers, verifyProfile, suspendUser, changeUserRole,
  listPendingTestimonials, approveTestimonial, changeRoleSchema,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

router.use(protect, restrictTo("admin"));
router.get("/analytics", getAnalytics);
router.get("/users", listUsers);
router.patch("/users/:id/verify", validateObjectId("id"), verifyProfile);
router.patch("/users/:id/suspend", validateObjectId("id"), suspendUser);
router.patch("/users/:id/role", validateObjectId("id"), validate(changeRoleSchema), changeUserRole);
router.get("/testimonials/pending", listPendingTestimonials);
router.patch("/testimonials/:id/approve", validateObjectId("id"), approveTestimonial);

export default router;
