import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { generateAndSendOtp, verifyOtp } from "../utils/otp.js";
import { sendPasswordResetEmail, sendEmailVerificationEmail } from "../utils/email.js";
import { namesLikelyMatch } from "../utils/nameMatch.js";
import { ok } from "../utils/apiResponse.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createRawToken = () => crypto.randomBytes(32).toString("hex");

// Transforms user database documents into consistent frontend payloads
const toPublicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  gender: user.gender,
  profileCode: user.profileCode,
  preferredLanguage: user.preferredLanguage,
  profileCompletion: user.profileCompletion,
  isProfileVerified: user.isProfileVerified,
  isPhoneVerified: user.isPhoneVerified,
  isEmailVerified: user.isEmailVerified,
  lastLoginAt: user.lastLoginAt,
  isPremium: user.isPremium(),
  premiumUntil: user.premiumUntil,
  freeUnlocksRemaining: user.freeUnlocksLeft(),
  planUnlocksRemaining: user.planUnlocksRemaining(),
  isAadhaarVerified: user.isAadhaarVerified,
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  gender: z.enum(["male", "female", "other"]),
  createdFor: z.enum(["self", "son", "daughter", "sibling", "relative"]).default("self"),
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{12}$/, "Identity verification number must be exactly 12 digits"),
  aadhaarName: z.string().trim().min(2, "Enter the name exactly as printed on your ID card").max(100),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Username or password identifier must be provided"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const updatePreferencesSchema = z.object({
  preferredLanguage: z.enum(["en", "hi"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Reset token is missing or invalid"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const requestEmailVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
});

export const confirmEmailVerificationSchema = z.object({
  token: z.string().min(10, "Verification token is missing or invalid"),
});

const issueTokensAndRespond = async (res, user, statusCode = 200) => {
  console.log("issueTokensAndRespond called");
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  user.lastLoginAt = new Date();
  await user.save();

  return res.status(statusCode).json({
    success: true,
    message: "Success",
    data: {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    },
  });
};

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  console.log("STEP 1: Request received");
  
  // FIXED: Destructured fields explicitly from the validation parse result
  const { 
    fullName, 
    phoneNumber, 
    email, 
    password, 
    gender, 
    createdFor, 
    aadhaarNumber, 
    aadhaarName 
  } = signupSchema.parse(req.body);

  console.log("STEP 2: Validation complete");

  const existing = await User.findOne({ $or: [{ phone: phoneNumber }, { email }] });
  if (existing) {
    res.status(409);
    throw new Error("An account with this phone or email already exists");
  }

  console.log("STEP 3: Identity cross-check running");

  if (!namesLikelyMatch(fullName, aadhaarName)) {
    res.status(422);
    throw new Error(
      "The name on your ID card doesn't match the full name you entered. Please check both and try again."
    );
  }

  console.log("STEP 4: Hashing unique identifier");

  const aadhaarHash = crypto.createHash("sha256").update(aadhaarNumber).digest("hex");

  console.log("STEP 5: Checking identifier duplicate entries");

  const aadhaarAlreadyUsed = await User.findOne({ aadhaarHash }).select("_id");
  if (aadhaarAlreadyUsed) {
    res.status(409);
    throw new Error("An account already exists for this verification record.");
  }

  console.log("STEP 6: Inserting user record");

  const user = await User.create({
    fullName,
    phone: phoneNumber,
    email,
    passwordHash: password,
    gender,
    createdFor,
    aadhaarHash,
    aadhaarLast4: aadhaarNumber.slice(-4),
    aadhaarNameOnCard: aadhaarName,
    isAadhaarVerified: true,
    authProvider: "password",
  });

  console.log("STEP 7: Initializing user application profiles");

  await Profile.create({ user: user._id });

  console.log("STEP 8: Handing off to token issuer");

  await issueTokensAndRespond(res, user, 201);

  console.log("STEP 9: Pipeline finished cleanly");
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] }).select("+passwordHash +refreshTokens");
  const passwordMatch = user ? await user.comparePassword(password) : false;

  if (!user || !user.passwordHash || !passwordMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (user.status !== "active") {
    res.status(403);
    throw new Error("This account is not active");
  }

  await issueTokensAndRespond(res, user);
});

// POST /api/auth/otp/request
export const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400);
    throw new Error("Phone number is required");
  }
  await generateAndSendOtp(phone);
  ok(res, {}, "OTP sent successfully");
});

// POST /api/auth/otp/verify
export const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const { phone, code, fullName } = req.body;
  const isValid = verifyOtp(phone, code);
  if (!isValid) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      fullName: fullName || "New User",
      phone,
      authProvider: "otp",
      isPhoneVerified: true,
    });
    await Profile.create({ user: user._id });
  } else if (!user.isPhoneVerified) {
    user.isPhoneVerified = true;
    await user.save();
  }

  await issueTokensAndRespond(res, user);
});

// POST /api/auth/google
export const googleLogin = asyncHandler(async (req, res) => {
  const { googleId, email, fullName } = req.body;
  if (!googleId || !email) {
    res.status(400);
    throw new Error("Missing Google account details");
  }

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({
      fullName: fullName || "New User",
      email,
      googleId,
      authProvider: "google",
      isEmailVerified: true,
    });
    await Profile.create({ user: user._id });
  }

  await issueTokensAndRespond(res, user);
});

// POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens?.includes(refreshToken)) {
    res.status(401);
    throw new Error("Refresh token not recognised");
  }

  const newAccessToken = generateAccessToken(user._id);
  ok(res, { accessToken: newAccessToken }, "Token refreshed");
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken && req.user) {
    req.user.refreshTokens = (req.user.refreshTokens || []).filter((t) => t !== refreshToken);
    await req.user.save();
  }
  ok(res, {}, "Logged out");
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  ok(res, { user: toPublicUser(req.user) });
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!user.passwordHash || !(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.passwordHash = newPassword;
  user.refreshTokens = [];
  await user.save();

  ok(res, {}, "Password updated. Please log in again on other devices.");
});

// PATCH /api/auth/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const validatedBody = updatePreferencesSchema.parse(req.body);
  
  const user = await User.findByIdAndUpdate(
    req.user._id, 
    { $set: validatedBody }, 
    { new: true, runValidators: true }
  );
  ok(res, { user: toPublicUser(user) }, "Preferences updated");
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const genericMessage = "If an account with that email exists, a reset link has been sent.";

  const user = await User.findOne({ email });
  if (!user) return ok(res, {}, genericMessage);

  const rawToken = createRawToken();
  user.passwordResetTokenHash = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0];
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user, resetUrl);
  } catch (err) {
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Could not send reset email. Please try again shortly.");
  }

  ok(res, {}, genericMessage);
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired. Please request a new one.");
  }

  user.passwordHash = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  ok(res, {}, "Your password has been reset. Please log in with your new password.");
});

// POST /api/auth/verify-email/request
export const requestEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.email) {
    res.status(400);
    throw new Error("Add an email address to your account before verifying it.");
  }
  if (user.isEmailVerified) {
    return ok(res, {}, "Your email is already verified.");
  }

  const rawToken = createRawToken();
  user.emailVerificationTokenHash = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0];
  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;
  await sendEmailVerificationEmail(user, verifyUrl);

  ok(res, {}, "Verification email sent. Please check your inbox.");
});

// POST /api/auth/verify-email/confirm
export const confirmEmailVerification = asyncHandler(async (req, res) => {
  const { token } = confirmEmailVerificationSchema.parse(req.body);
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("This verification link is invalid or has expired. Please request a new one.");
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  ok(res, {}, "Your email has been verified.");
});

// DELETE /api/auth/me
export const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { status: "deactivated", refreshTokens: [] } });
  ok(res, {}, "Your account has been deactivated");
});