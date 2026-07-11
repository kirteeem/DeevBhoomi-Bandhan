import fs from "fs";
import path from "path";
import Profile from "../models/Profile.js";

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const isProfilePhoto = req.body.isProfilePhoto === "true";

    const newPhoto = {
      url: `/uploads/${req.file.filename}`,
      isProfilePhoto,
      isPrivate: false,
    };

    // Find existing photo of the same type
    const existingIndex = profile.photos.findIndex(
      (photo) => photo.isProfilePhoto === isProfilePhoto
    );

    if (existingIndex !== -1) {
      // Delete old image file
      const oldPath = path.join(
        process.cwd(),
        profile.photos[existingIndex].url.replace("/uploads/", "uploads/")
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      // Replace photo
      profile.photos[existingIndex] = newPhoto;
    } else {
      // Add new slot
      profile.photos.push(newPhoto);
    }

    // Safety: only 2 photos
    profile.photos = profile.photos.slice(0, 2);

    await profile.save();

    console.log("Photos after save:", profile.photos);
    const uploaded = profile.photos.find(
      (p) => p.url === newPhoto.url
    );

    res.json({
      id: uploaded._id,
      url: uploaded.url,
      isProfilePhoto: uploaded.isProfilePhoto,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};