import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    // Professional matrimonial ID show
    // n across the platform (e.g. "DBB100042")
    // so members can share/reference each other without exposing Mongo ids.
    profileCode: { type: String, unique: true, sparse: true, index: true },

    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, select: false },
    authProvider: { type: String, enum: ["password", "otp", "google"], default: "password" },
    googleId: { type: String, select: false },

    role: { type: String, enum: ["user", "priest", "admin"], default: "user" },
    gender: { type: String, enum: ["male", "female", "other"] },
    createdFor: { type: String, enum: ["self", "son", "daughter", "sibling", "relative"], default: "self" },

    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isProfileVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended", "deactivated", "deleted"], default: "active" },

    preferredLanguage: { type: String, enum: ["en", "hi"], default: "hi" },
    profileCompletion: { type: Number, default: 10 },

    // Denormalized for fast reads on every profile view / match list — the
    // Subscription collection remains the source of truth and is what
    // actually gets written to on payment verification / expiry.
    premiumUntil: { type: Date, default: null },
    activePlan: {
      type: String, // Changes type to string to accept plan names/slugs
      enum: ["free", "premium_monthly", "premium_yearly"], 
      default: "free"
    },
    // When the current plan was activated — used to know the window over
    // which the quotas below apply (reset every time a new plan is bought).
    planActivatedAt: { type: Date, default: null },

    // Free kundali-matching requests granted by the active plan.
    planKundaliQuota: { type: Number, default: 0 },
    planKundaliUsed: { type: Number, default: 0 },

    // Every new member gets 5 free full-profile-detail unlocks, independent
    // of the premium plan's view quota above. Spending one permanently
    // unlocks that specific profile's full details (see ProfileUnlock) —
    // it does NOT unlock contact info, which stays premium-only.
    freeUnlocksRemaining: {
      type: Number,
      default: 5,
    },

    // Premium members can reveal contact info (address, phone, email) for
    // up to 10 other members. Free members never get a quota here — they
    // can only see contact info once an Interest is mutually accepted
    // (see ContactUnlock / interestController.js). Reset to 10 every time
    // a new plan is activated.
    planUnlockQuota: {
      type: Number,
      default: 0
    },
    planUnlocksUsed: {
      type: Number,
      default: 0
    },

    // Set once, the first time this member's profile is complete enough
    // to be sent to the priest/admin team for a manual identity check —
    // prevents sending the same verification-request email repeatedly.
    idVerificationEmailSent: { type: Boolean, default: false },

    // --- Aadhaar-based identity check, done once at signup -----------------
    // Aadhaar numbers are sensitive government-ID data, so the raw 12-digit
    // number is never stored — only a one-way hash (to block duplicate
    // signups on the same Aadhaar) and the masked last 4 digits (for support
    // to reference). The name printed on the card is kept so the match that
    // was approved at signup can be reviewed later if ever disputed.
    aadhaarHash: { type: String, select: false, index: true, sparse: true },
    aadhaarLast4: { type: String },
    aadhaarNameOnCard: { type: String, trim: true },
    isAadhaarVerified: { type: Boolean, default: false },

    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: Date,
    // Updated (best-effort, not awaited) on every authenticated request so we
    // can show a real "online" indicator instead of a hardcoded one.
    lastActiveAt: Date,

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Mints a sequential, human-friendly professional ID once, on first save —
// used everywhere the platform needs to reference a member without exposing
// their Mongo _id (kundali matching, profile menu, sharing, etc).
userSchema.pre("save", async function (next) {
  if (!this.isNew || this.profileCode) return next();
  try {
    const counter = await Counter.findByIdAndUpdate(
      "profileCode",
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    this.profileCode = `DBB${counter.seq}`;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.isPremium = function () {
  return !!this.premiumUntil && this.premiumUntil.getTime() > Date.now();
};

userSchema.methods.planUnlocksRemaining = function () {
  return Math.max(
    0,
    (this.planUnlockQuota || 0) - (this.planUnlocksUsed || 0)
  );
};

userSchema.methods.kundaliMatchesRemaining = function () {
  return Math.max(0, (this.planKundaliQuota || 0) - (this.planKundaliUsed || 0));
};

userSchema.methods.freeUnlocksLeft = function () {
  return Math.max(0, this.freeUnlocksRemaining || 0);
};

export default mongoose.model("User", userSchema);