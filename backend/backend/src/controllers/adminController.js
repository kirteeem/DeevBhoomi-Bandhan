import { z } from "zod";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Testimonial from "../models/Testimonial.js";
import AdminLog from "../models/AdminLog.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

export const changeRoleSchema = z.object({
  role: z.enum(["user", "priest", "admin"]),
});

// GET /api/admin/analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, verifiedProfiles, pendingVerification, totalPriests] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ isProfileVerified: true }),
    User.countDocuments({ isProfileVerified: false, role: "user" }),
    User.countDocuments({ role: "priest" }),
  ]);
  ok(res, { totalUsers, verifiedProfiles, pendingVerification, totalPriests });
});

// GET /api/admin/users?status=&page=&limit=
export const listUsers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  const total = await User.countDocuments(query);
  ok(res, { users, total });
});

// PATCH /api/admin/users/:id/verify
export const verifyProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isProfileVerified: true }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "verify_profile", targetType: "User", targetId: user._id });
  ok(res, { user }, "Profile verified");
});

// PATCH /api/admin/users/:id/suspend
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: "suspended" }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "suspend_user", targetType: "User", targetId: user._id });
  ok(res, { user }, "User suspended");
});

// PATCH /api/admin/users/:id/role  { role }
export const changeUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "change_role", targetType: "User", targetId: user._id, meta: { role: req.body.role } });
  ok(res, { user }, "Role updated");
});

// GET/POST /api/admin/testimonials — content moderation for success stories
export const listPendingTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isApproved: false }).sort({ createdAt: -1 });
  ok(res, { testimonials });
});

export const approveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }
  ok(res, { testimonial }, "Testimonial approved");
});
