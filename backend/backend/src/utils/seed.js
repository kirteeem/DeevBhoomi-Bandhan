import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Priest from "../models/Priest.js";
import Plan from "../models/Plan.js";
import Counter from "../models/Counter.js";
import mongoose from "mongoose";

// Single-tier premium plan. Buying it unlocks unlimited profile views, full
// profile details on every member (see profileController.js `viewerIsPremium`),
// free kundali matching requests, and visibility into who viewed you.
const defaultPlans = [
  {
    name: "Premium",
    slug: "premium",
    tagline: "Everything you need for a serious search",
    priceInPaise: 49900, // ₹499
    durationDays: 90,
    sortOrder: 1,
    maxProfileViews: null,
    freeKundaliMatches: 5,
    isActive: true,
    features: [
      "Unlimited profile views",
      "Full personal details unlocked on every profile",
      "5 free kundali matching requests",
      "See who viewed your profile",
      "Priority listing in match results",
      "Unblurred photos on every profile",
      "Send unlimited interests",
      "Valid for 90 days",
    ],
  },
];

const run = async () => {
  await connectDB();

  const existingPriest = await User.findOne({ role: "priest" });
  if (!existingPriest) {
    const priestUser = await User.create({
      fullName: "Jagat Ram Sharma",
      phone: "9800000000",
      passwordHash: "ChangeMe@123",
      role: "priest",
      gender: "male",
      isPhoneVerified: true,
      isProfileVerified: true,
    });

    await Priest.create({
      user: priestUser._id,
      displayName: "Pandit Jagat Ram Sharma",
      bio: "Senior astrologer specialising in Himachali kundali matching, manglik consultation and muhurat guidance.",
      yearsOfExperience: 25,
      specializations: ["Kundali Matching", "Manglik Dosha", "Muhurat Guidance"],
    });

    console.log("Seeded priest account: phone 9800000000 / password ChangeMe@123");
  } else {
    console.log("Priest account already seeded.");
  }

  for (const plan of defaultPlans) {
    await Plan.findOneAndUpdate({ slug: plan.slug }, plan, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  const currentSlugs = defaultPlans.map((p) => p.slug);
  await Plan.updateMany({ slug: { $nin: currentSlugs } }, { isActive: false });
  console.log(`Seeded ${defaultPlans.length} subscription plans (legacy plans deactivated).`);

  // Backfill professional IDs for any accounts created before this feature
  // existed (new signups get one automatically via the User pre-save hook).
  const usersMissingCode = await User.find({ profileCode: { $in: [null, undefined] } });
  for (const u of usersMissingCode) {
    const counter = await Counter.findByIdAndUpdate(
      "profileCode",
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    u.profileCode = `DBB${counter.seq}`;
    await u.save();
  }
  if (usersMissingCode.length) {
    console.log(`Backfilled professional IDs for ${usersMissingCode.length} existing user(s).`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
