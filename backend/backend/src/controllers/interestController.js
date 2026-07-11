import { z } from "zod";
import mongoose from "mongoose";
import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import ContactUnlock from "../models/ContactUnlock.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid id");

export const sendInterestSchema = z.object({
  receiverId: objectId,
  message: z.string().max(300).optional(),
});

export const respondToInterestSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

// POST /api/interests  { receiverId, message }
export const sendInterest = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;
  if (String(receiverId) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot send interest to yourself");
  }

  const interest = await Interest.findOneAndUpdate(
    { sender: req.user._id, receiver: receiverId },
    { $setOnInsert: { message }, status: "pending" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Notification.create({
    user: receiverId,
    fromUser: req.user._id,
    type: "new_interest",
    title: "New Interest Received",
    body: `${req.user.fullName} sent you an interest.`,
    relatedId: interest._id,
  });

  const io = req.app.get("io");
  io?.to(`user:${receiverId}`).emit("notification:new", { type: "new_interest" });

  ok(res, { interest }, "Interest sent", 201);
});

// PATCH /api/interests/:id  { status: accepted | declined }
export const respondToInterest = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const interest = await Interest.findById(req.params.id);
  if (!interest || String(interest.receiver) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Interest not found");
  }

  interest.status = status;
  await interest.save();

  if (status === "accepted") {
    await Notification.create({
      user: interest.sender,
      fromUser: req.user._id,
      type: "interest_accepted",
      title: "Interest Accepted",
      body: `${req.user.fullName} accepted your interest. You are now matched. Unlock the profile to view full details.`,
      relatedId: interest._id,
    });
  }

  ok(res, { interest }, "Interest updated");
});

// GET /api/interests/received | /sent
export const listInterests = asyncHandler(async (req, res) => {
  const direction = req.query.direction === "sent" ? "sender" : "receiver";
  const interests = await Interest.find({ [direction]: req.user._id })
    .populate("sender receiver", "fullName gender isProfileVerified")
    .sort({ createdAt: -1 });

  const userIds = [
    ...new Set(
      interests
        .flatMap((interest) => [interest.sender?._id, interest.receiver?._id])
        .filter(Boolean)
        .map(String)
    ),
  ];

  const profiles = await Profile.find({ user: { $in: userIds } }).select("user photos");
  const photosByUserId = new Map(profiles.map((profile) => [String(profile.user), profile.photos || []]));

  const withPhotos = interests.map((interest) => {
    const obj = interest.toObject();
    if (obj.sender?._id) obj.sender.photos = photosByUserId.get(String(obj.sender._id)) || [];
    if (obj.receiver?._id) obj.receiver.photos = photosByUserId.get(String(obj.receiver._id)) || [];
    return obj;
  });

  ok(res, { interests: withPhotos });
});