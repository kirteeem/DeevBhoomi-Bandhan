import { z } from "zod";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import ProfileView from "../models/ProfileView.js";
import Shortlist from "../models/Shortlist.js";
import ProfileUnlock from "../models/ProfileUnlock.js";
import Interest from "../models/Interest.js"; // Model import for interest validation
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { sendIdVerificationEmail } from "../utils/email.js";

// Mirrors the wizard's editable fields. Anything not listed here is stripped,
// so a crafted request body can't set unexpected fields (e.g. profileCompletion).
export const updateProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  heightCm: z.number().min(100).max(250).optional(),
  maritalStatus: z.enum(["never_married", "divorced", "widowed", "awaiting_divorce"]).optional(),
  manglik: z.enum(["yes", "no", "dont_know"]).optional(),
  district: z.enum(["Shimla", "Mandi", "Kullu", "Kangra", "Hamirpur", "Una", "Bilaspur", "Solan", "Sirmaur", "Chamba", "Kinnaur", "Lahaul-Spiti"]).optional(),
  city: z.string().max(100).optional(),
  // Full residential address — treated as sensitive contact info, see
  // ProfileUnlock. Required at profile-creation time on the frontend wizard,
  // optional here so partial draft saves (Save Progress) never fail.
  address: z.string().max(300).optional(),
  education: z.object({ degree: z.string().max(100).optional(), field: z.string().max(100).optional(), college: z.string().max(150).optional() }).optional(),
  occupation: z.object({ title: z.string().max(100).optional(), company: z.string().max(150).optional(), annualIncomeRange: z.string().max(50).optional() }).optional(),
  family: z
    .object({
      fatherOccupation: z.string().max(100).optional(),
      motherOccupation: z.string().max(100).optional(),
      siblings: z.number().min(0).max(20).optional(),
      familyType: z.enum(["nuclear", "joint"]).optional(),
      familyValues: z.enum(["traditional", "moderate", "liberal"]).optional(),
    })
    .optional(),
  religion: z.string().max(50).optional(),
  caste: z.string().max(50).optional(),
  subCaste: z.string().max(50).optional(),
  gotra: z.string().max(50).optional(),
  lifestyle: z
    .object({
      diet: z.enum(["vegetarian", "non_vegetarian", "eggetarian", "vegan"]).optional(),
      smoking: z.enum(["no", "occasionally", "yes"]).optional(),
      drinking: z.enum(["no", "occasionally", "yes"]).optional(),
    })
    .optional(),
  horoscope: z
    .object({
      birthTime: z.string().max(20).optional(),
      birthPlace: z.string().max(150).optional(),
      rashi: z.string().max(50).optional(),
      nakshatra: z.string().max(50).optional(),
      manglikDetail: z.string().max(300).optional(),
    })
    .optional(),
  aboutMe: z.string().max(1500).optional(),
  interests: z.array(z.string().max(50)).max(30).optional(),
  partnerPreference: z
    .object({
      ageMin: z.number().min(18).max(100).optional(),
      ageMax: z.number().min(18).max(100).optional(),
      heightMinCm: z.number().min(100).max(250).optional(),
      districts: z.array(z.string()).optional(),
      education: z.array(z.string()).optional(),
      maritalStatus: z.array(z.string()).optional(),
    })
    .optional(),
  visibility: z.enum(["public", "members_only", "hidden"]).optional(),
});

// Fields we check to compute a friendly profile-strength percentage.
const WEIGHTED_FIELDS = [
  ["dateOfBirth", 8], ["heightCm", 5], ["maritalStatus", 5], ["district", 8], ["address", 5],
  ["education.degree", 10], ["occupation.title", 10], ["family.familyType", 5],
  ["religion", 5], ["lifestyle.diet", 5], ["aboutMe", 12], ["horoscope.rashi", 7],
  ["photos", 20],
];

const getAt = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);

const computeCompletion = (profileDoc) => {
  let score = 10; // base for having an account
  for (const [path, weight] of WEIGHTED_FIELDS) {
    const val = getAt(profileDoc, path);
    const filled = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (filled) score += weight;
  }
  return Math.min(100, score);
};

// GET /api/profiles/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }).populate(
    "user",
    "fullName gender role profileCompletion profileCode phone"
  );
  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }
  ok(res, {
    profile,
    quota: {
      planUnlocksRemaining: req.user.planUnlocksRemaining(),
      kundaliMatchesRemaining: req.user.kundaliMatchesRemaining(),
      freeUnlocksRemaining: req.user.freeUnlocksLeft(),
    },
  });
});

// GET /api/profiles/code/:code
export const getProfileByCode = asyncHandler(async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const user = await User.findOne({ profileCode: code }).select("fullName gender profileCode");
  if (!user) {
    res.status(404);
    throw new Error("No member found with that professional ID");
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error("That is your own professional ID");
  }

  const profile = await Profile.findOne({ user: user._id }).select("district");
  ok(res, {
    profile: {
      userId: user._id,
      fullName: user.fullName,
      gender: user.gender,
      profileCode: user.profileCode,
      district: profile?.district,
    },
  });
});

// PATCH /api/profiles/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  // Enforce Zod validation structure and safety
  const validatedUpdates = updateProfileSchema.parse(req.body);

  let profile = await Profile.findOneAndUpdate(
    { user: req.user._id }, 
    { $set: validatedUpdates }, 
    { new: true, upsert: true }
  );

  const completion = computeCompletion(profile.toObject());
  profile.profileCompletion = completion;
  await profile.save();
  await User.findByIdAndUpdate(req.user._id, { profileCompletion: completion });

  // First time this profile is (near) fully complete, ask the priest /
  // verification team to manually cross-check the member's identity. Only
  // fires once per account (idVerificationEmailSent), so re-saving the
  // profile later never spams the priest's inbox.
  if (completion >= 90 && !req.user.idVerificationEmailSent) {
    try {
      await sendIdVerificationEmail({ user: req.user, profile });
    } catch (err) {
      console.error("Failed to send priest ID-verification email:", err.message);
    }
    req.user.idVerificationEmailSent = true;
    await req.user.save();
  }

  ok(res, { profile }, "Profile updated");
});

// GET /api/profiles/:userId/contact
// Returns address/phone/email ONLY if the requester has an active unlock
// (own profile, mutual accepted interest, or spent one of their plan unlocks).
// Never bundled into the general profile response.
export const getContactDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const targetUser = await User.findById(userId).select("fullName email phone profileCode");
  if (!targetUser) {
    res.status(404);
    throw new Error("Profile not found");
  }

  const isOwnProfile = String(userId) === String(req.user._id);
  const unlocked =
    isOwnProfile ||
    Boolean(
      await ProfileUnlock.findOne({
        viewer: req.user._id,
        unlockedUser: userId,
      })
    );

  if (!unlocked) {
    return ok(res, {
      contactUnlocked: false,
      freeUnlocksRemaining: req.user.freeUnlocksLeft(),
      planUnlocksRemaining: req.user.planUnlocksRemaining(),
    });
  }

  const targetProfile = await Profile.findOne({ user: userId }).select("address district city");

  ok(res, {
    contactUnlocked: true,
    contact: {
      fullName: targetUser.fullName,
      email: targetUser.email,
      phone: targetUser.phone,
      address: targetProfile?.address,
      district: targetProfile?.district,
      city: targetProfile?.city,
    },
    freeUnlocksRemaining: req.user.freeUnlocksLeft(),
    planUnlocksRemaining: req.user.planUnlocksRemaining(),
  });
});

// POST /api/profiles/:userId/contact/unlock
// Forwarding unlock contact details request directly to the unified profile unlock logic.
export const unlockContactDetails = asyncHandler(async (req, res) => {
  return unlockProfileDetails(req, res);
});

// GET /api/profiles/:userId
export const getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId }).populate(
    "user",
    "fullName gender isProfileVerified lastActiveAt profileCode"
  );
  if (!profile || profile.visibility === "hidden") {
    res.status(404);
    throw new Error("Profile not found");
  }

  const isOwnProfile = String(profile.user._id) === String(req.user._id);
  const viewerIsPremium = req.user.isPremium();
  const restrictedView = !isOwnProfile && !viewerIsPremium;

  const everViewed = !isOwnProfile
    ? Boolean(await ProfileView.findOne({ viewer: req.user._id, viewedUser: profile.user._id }))
    : true;

  if (!isOwnProfile && viewerIsPremium && !everViewed && req.user.planUnlockQuota !== null) {
    if (req.user.planUnlocksUsed >= req.user.planUnlockQuota) {
      res.status(403);
      throw new Error("You've reached your plan's profile view limit. Upgrade to view more profiles.");
    }
  }

  const alreadyUnlocked = isOwnProfile
    ? true
    : Boolean(await ProfileUnlock.findOne({ viewer: req.user._id, unlockedUser: profile.user._id }));
  const detailsUnlocked = isOwnProfile || viewerIsPremium || alreadyUnlocked;

  const full = profile.toObject();
  let profileObj;

  if (detailsUnlocked) {
    profileObj = full;
    if (restrictedView) {
profileObj.photos = profileObj.photos || [];
    }
  } else {
    const teaserPhoto = (full.photos || []).find((p) => p.isProfilePhoto) || (full.photos || [])[0];
    profileObj = {
      _id: full._id,
      user: full.user,
      dateOfBirth: full.dateOfBirth,
      heightCm: full.heightCm,
      district: full.district,
      city: full.city,
      occupation: full.occupation ? { title: full.occupation.title } : undefined,
      education: full.education ? { degree: full.education.degree } : undefined,
      religion: full.religion,
      profileCompletion: full.profileCompletion,
      photos: teaserPhoto ? [teaserPhoto] : [],
    };
  }

  if (!isOwnProfile) {
    const recentView = await ProfileView.findOne({
      viewer: req.user._id,
      viewedUser: profile.user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });
    if (!recentView) {
      await ProfileView.create({ viewer: req.user._id, viewedUser: profile.user._id });
    }

    if (viewerIsPremium && !everViewed && req.user.planUnlockQuota !== null) {
      req.user.planUnlocksUsed += 1;
      await req.user.save();
    }
  }

  const isShortlisted = isOwnProfile
    ? false
    : Boolean(await Shortlist.findOne({ user: req.user._id, shortlistedUser: profile.user._id }));

  ok(res, {
    profile: profileObj,
    restrictedView,
    isOwnProfile,
    isShortlisted,
    planUnlocksRemaining: req.user.planUnlocksRemaining(),
    detailsUnlocked,
    freeUnlocksRemaining: req.user.freeUnlocksLeft(),
  });
});

// POST /api/profiles/:userId/unlock
export const unlockProfileDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (String(userId) === String(req.user._id)) {
    res.status(400);
    throw new Error("This is your own profile");
  }


  const targetUser = await User.findById(userId).select("_id");
  if (!targetUser) {
    res.status(404);
    throw new Error("Profile not found");
  }
  const matchedInterest = await Interest.findOne({
  $or: [
    {
      sender: req.user._id,
      receiver: userId,
      status: "accepted",
    },
    {
      sender: userId,
      receiver: req.user._id,
      status: "accepted",
    },
  ],
});

if (!matchedInterest) {
  res.status(403);
  throw new Error(
    "You can unlock details only after both users have accepted the interest."
  );
}

  const existing = await ProfileUnlock.findOne({ viewer: req.user._id, unlockedUser: userId });
  if (existing) {
    return ok(
  res,
  {
    detailsUnlocked: true,
    freeUnlocksRemaining: req.user.freeUnlocksLeft(),
    planUnlocksRemaining: req.user.planUnlocksRemaining(),
  },
  "Unlocked"
);
  }

  const viewerIsPremium = req.user.isPremium();
  if (viewerIsPremium) {
    if (req.user.planUnlocksRemaining() <= 0) {
      res.status(403);
      throw new Error("No unlocks remaining.");
    }
    
    req.user.planUnlocksUsed = (req.user.planUnlocksUsed || 0) + 1;
    await ProfileUnlock.create({ viewer: req.user._id, unlockedUser: userId, method: "premium" });
    await req.user.save();
    
    return ok(res, { detailsUnlocked: true, freeUnlocksRemaining: req.user.freeUnlocksLeft() }, "Unlocked");
  }

  if (req.user.freeUnlocksLeft() <= 0) {
    res.status(403);
    throw new Error("You've used all your free profile unlocks. Upgrade to Premium to keep viewing full profiles.");
  }

  await ProfileUnlock.create({ viewer: req.user._id, unlockedUser: userId, method: "free" });
  req.user.freeUnlocksRemaining = req.user.freeUnlocksLeft() - 1;
  await req.user.save();

  ok(
  res,
  {
    detailsUnlocked: true,
    freeUnlocksRemaining: req.user.freeUnlocksLeft(),
    planUnlocksRemaining: req.user.planUnlocksRemaining(),
  },
  "Profile unlocked"
);
});

// GET /api/profiles/me/visitors
export const getMyVisitors = asyncHandler(async (req, res) => {
  const distinctViewerIds = await ProfileView.distinct("viewer", { viewedUser: req.user._id });
  const totalVisitors = distinctViewerIds.length;

  if (!req.user.isPremium()) {
    return ok(res, { totalVisitors, visitors: [], locked: true });
  }

  const recentViews = await ProfileView.find({ viewedUser: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate({ path: "viewer", select: "fullName isProfileVerified lastActiveAt" });

  const seen = new Set();
  const visitors = [];
  for (const view of recentViews) {
    if (!view.viewer) continue;
    const id = String(view.viewer._id);
    if (seen.has(id)) continue;
    seen.add(id);
    const viewerProfile = await Profile.findOne({ user: view.viewer._id }).select("photos");
    const user = view.viewer.toObject();
    user.photos = viewerProfile?.photos || [];
    visitors.push({ user, viewedAt: view.createdAt });
  }

  ok(res, { totalVisitors, visitors, locked: false });
});

// POST /api/profiles/:userId/shortlist
export const toggleShortlist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (String(userId) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot shortlist yourself");
  }

  const existing = await Shortlist.findOne({ user: req.user._id, shortlistedUser: userId });
  if (existing) {
    await existing.deleteOne();
    return ok(res, { shortlisted: false }, "Removed from shortlist");
  }

  await Shortlist.create({ user: req.user._id, shortlistedUser: userId });
  ok(res, { shortlisted: true }, "Added to shortlist", 201);
});

// GET /api/profiles/me/shortlisted
export const getMyShortlist = asyncHandler(async (req, res) => {
  const shortlist = await Shortlist.find({ user: req.user._id }).sort({ createdAt: -1 });
  const userIds = shortlist.map((s) => s.shortlistedUser);

  const profiles = await Profile.find({ user: { $in: userIds } }).populate(
    "user",
    "fullName gender isProfileVerified lastActiveAt profileCode"
  );

  ok(res, { total: profiles.length, profiles });
});