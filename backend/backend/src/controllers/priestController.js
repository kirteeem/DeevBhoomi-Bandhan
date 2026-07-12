import { z } from "zod";
import KundaliRequest from "../models/KundaliRequest.js";
import KundaliReport from "../models/KundaliReport.js";
import Priest from "../models/Priest.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { notifyUser } from "../utils/notify.js";

export const updateStatusSchema = z.object({
  status: z.enum(["pending", "in_review", "completed", "cancelled"]),
  notes: z.string().max(1000).optional(),
});

export const submitReportSchema = z.object({
  gunMilanScore: z.number().min(0).max(36).optional(),
  manglikDosha: z.enum(["none", "partial", "full"]).optional(),
  summary: z.string().max(2000).optional(),
  recommendation: z.enum(["favourable", "favourable_with_remedy", "not_recommended"]).optional(),
  reportFileUrl: z.string().url().optional(),
});

// GET /api/priest/queue — pending + in-review kundalis for the logged-in priest
export const getQueue = asyncHandler(async (req, res) => {
  const priest = await Priest.findOne({ user: req.user._id });
  if (!priest) {
    res.status(404);
    throw new Error("Priest profile not found");
  }

  const pending = await KundaliRequest.find({ assignedPriest: priest._id, status: { $in: ["pending", "in_review"] } })
    .populate("profileA profileB", "fullName")
    .sort({ createdAt: 1 });

  const completed = await KundaliRequest.countDocuments({ assignedPriest: priest._id, status: "completed" });

  ok(res, { pending, completedCount: completed });
});

// PATCH /api/priest/requests/:id/status
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await KundaliRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  request.status = req.body.status;
  request.notes = req.body.notes ?? request.notes;
  await request.save();
  ok(res, { request });
});

// POST /api/priest/requests/:id/report
export const submitReport = asyncHandler(async (req, res) => {
  const priest = await Priest.findOne({ user: req.user._id });
  if (!priest) {
    res.status(404);
    throw new Error("Priest profile not found");
  }
  const request = await KundaliRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const { gunMilanScore, manglikDosha, summary, recommendation, reportFileUrl } = req.body;
  const report = await KundaliReport.create({
    request: request._id,
    preparedBy: priest._id,
    gunMilanScore,
    manglikDosha,
    summary,
    recommendation,
    reportFileUrl,
  });

  request.status = "completed";
  await request.save();
  priest.totalMatchesReviewed += 1;
  await priest.save();

  await notifyUser({
    io: req.app.get("io"),
    user: request.requestedBy,
    type: "kundali_ready",
    title: "Your Kundali Report is Ready",
    body: "Pandit ji has completed your kundali review.",
    relatedId: report._id,
  });

  ok(res, { report }, "Report submitted", 201);
});
