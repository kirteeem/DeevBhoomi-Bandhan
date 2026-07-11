import { Router } from "express";
import {
  signup,
  login,
  requestOtp,
  verifyOtpAndLogin,
  googleLogin,
  refreshAccessToken,
  logout,
  getMe,
  changePassword,
  updatePreferences,
  deactivateAccount,
  forgotPassword,
  resetPassword,
  requestEmailVerification,
  confirmEmailVerification,
  signupSchema,
  loginSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestEmailVerificationSchema,
  confirmEmailVerificationSchema,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtpAndLogin);
router.post("/google", googleLogin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);
router.patch("/preferences", protect, validate(updatePreferencesSchema), updatePreferences);
router.delete("/me", protect, deactivateAccount);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post(
  "/verify-email/request",
  protect,
  validate(requestEmailVerificationSchema),
  requestEmailVerification
);
router.post("/verify-email/confirm", validate(confirmEmailVerificationSchema), confirmEmailVerification);

export default router;
