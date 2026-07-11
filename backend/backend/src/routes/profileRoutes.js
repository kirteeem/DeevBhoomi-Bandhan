import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  getProfileByCode,
  updateProfileSchema,
  getMyVisitors,
  toggleShortlist,
  getMyShortlist,
  unlockProfileDetails,
  getContactDetails,
  unlockContactDetails,
} from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadProfilePhoto } from "../controllers/uploadController.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

router.get("/me", protect, getMyProfile);
router.patch("/me", protect, validate(updateProfileSchema), updateMyProfile);
router.get("/me/visitors", protect, getMyVisitors);
router.get("/me/shortlisted", protect, getMyShortlist);
router.post(
  "/upload-photo",
  protect,
  upload.single("image"),
  uploadProfilePhoto
);
// Must be registered before the catch-all :userId route below since "code"
// would otherwise be swallowed as an ObjectId path segment.
router.get("/code/:code", protect, getProfileByCode);

// Keep this catch-all last — it matches any single-segment path.
router.get("/:userId", protect, validateObjectId("userId"), getProfileByUserId);
router.post("/:userId/shortlist", protect, validateObjectId("userId"), toggleShortlist);
router.post("/:userId/unlock", protect, validateObjectId("userId"), unlockProfileDetails);
router.get("/:userId/contact", protect, validateObjectId("userId"), getContactDetails);
router.post("/:userId/contact/unlock", protect, validateObjectId("userId"), unlockContactDetails);

export default router;
