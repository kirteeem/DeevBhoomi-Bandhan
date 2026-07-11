import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadBuffer } from "../utils/cloudinary.js";
import Profile from "../models/Profile.js";
import { ok } from "../utils/apiResponse.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

// POST /api/upload/photo  (multipart/form-data, field name: "photo")
router.post(
  "/photo",
  protect,
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }
    const result = await uploadBuffer(req.file.buffer, `devbhoomi-bandhan/profiles/${req.user._id}`);

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { photos: { url: result.secure_url, publicId: result.public_id, isProfilePhoto: req.body.isProfilePhoto === "true" } } },
      { new: true }
    );

    ok(res, { profile }, "Photo uploaded", 201);
  })
);

export default router;
