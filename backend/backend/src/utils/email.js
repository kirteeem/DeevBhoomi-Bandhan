// Thin abstraction over an SMTP provider (SendGrid, SES, Gmail, etc).
// If SMTP_HOST is not configured, emails are logged to the console instead of
// failing, so the auth flows keep working end-to-end in local development.
import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
};

/**
 * Sends an email. Falls back to logging when SMTP isn't configured so that
 * signup/password-reset flows never hard-fail in dev/test environments.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();

  if (!t) {
    console.log(`[EMAIL] (SMTP not configured — logging only)
  To: ${to}
  Subject: ${subject}
  ${text || html}`);
    return { delivered: false, logged: true };
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || '"Devbhoomi Bandhan" <no-reply@devbhoomibandhan.com>',
    to,
    subject,
    html,
    text,
  });
  return { delivered: true, logged: false };
};

export const sendPasswordResetEmail = async (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: "Reset your Devbhoomi Bandhan password",
    text: `Hi ${user.fullName}, reset your password using this link (valid for 30 minutes): ${resetUrl}. If you did not request this, ignore this email.`,
    html: `<p>Hi ${user.fullName},</p><p>Use the link below to reset your Devbhoomi Bandhan password. This link is valid for <strong>30 minutes</strong>.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  });

export const sendEmailVerificationEmail = async (user, verifyUrl) =>
  sendEmail({
    to: user.email,
    subject: "Verify your email — Devbhoomi Bandhan",
    text: `Hi ${user.fullName}, verify your email using this link (valid for 24 hours): ${verifyUrl}`,
    html: `<p>Hi ${user.fullName},</p><p>Please verify your email address to unlock all features of your account.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link is valid for <strong>24 hours</strong>.</p>`,
  });

// Fixed inbox that reviews every free kundali-matching request submitted on
// the platform. Kept as a constant here (rather than scattered inline)
// so it only needs updating in one place.
export const PRIEST_REQUEST_EMAIL = "kirteemsharma.dev@gmail.com";

// Sent once per member (see User.idVerificationEmailSent), the first time
// their profile is complete enough to be worth manually reviewing — gives
// the priest/verification team a chance to cross-check the member's stated
// identity (name, phone, email, address) before the profile is marked
// isProfileVerified, cutting down on fake/duplicate profiles.
export const sendIdVerificationEmail = async ({ user, profile }) =>
  sendEmail({
    to: PRIEST_REQUEST_EMAIL,
    subject: `New Profile ID Verification Request — ${user.profileCode}`,
    text: [
      `A member has completed their Devbhoomi Bandhan profile and needs an identity check.`,
      ``,
      `Name: ${user.fullName}`,
      `Professional ID: ${user.profileCode}`,
      `Phone: ${user.phone || "—"}`,
      `Email: ${user.email || "—"}`,
      `Address: ${profile?.address || "—"}`,
      `District: ${profile?.district || "—"}, ${profile?.city || "—"}`,
      ``,
      `Please verify this member's identity documents in the admin panel and mark the profile as verified once confirmed.`,
    ].join("\n"),
    html: `
      <p>A member has completed their Devbhoomi Bandhan profile and needs an identity check.</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Name</strong></td><td>${user.fullName}</td></tr>
        <tr><td><strong>Professional ID</strong></td><td>${user.profileCode}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${user.phone || "—"}</td></tr>
        <tr><td><strong>Email</strong></td><td>${user.email || "—"}</td></tr>
        <tr><td><strong>Address</strong></td><td>${profile?.address || "—"}</td></tr>
        <tr><td><strong>District</strong></td><td>${profile?.district || "—"}, ${profile?.city || "—"}</td></tr>
      </table>
      <p>Please verify this member's identity documents in the admin panel and mark the profile as verified once confirmed.</p>
    `,
  });

export const sendKundaliMatchRequestEmail = async ({ requester, partner, phone, requestType }) =>
  sendEmail({
    to: PRIEST_REQUEST_EMAIL,
    subject: `New Kundali Matching Request — ${requester.profileCode}`,
    text: [
      `A new ${requestType.replace(/_/g, " ")} request has been submitted on Devbhoomi Bandhan.`,
      ``,
      `Requester name: ${requester.fullName}`,
      `Requester professional ID: ${requester.profileCode}`,
      `Requester phone: ${phone}`,
      ``,
      `Partner name: ${partner.fullName}`,
      `Partner professional ID: ${partner.profileCode}`,
      ``,
      `Please review both members' kundali details in the admin panel and share the report.`,
    ].join("\n"),
    html: `
      <p>A new <strong>${requestType.replace(/_/g, " ")}</strong> request has been submitted on Devbhoomi Bandhan.</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Requester name</strong></td><td>${requester.fullName}</td></tr>
        <tr><td><strong>Requester professional ID</strong></td><td>${requester.profileCode}</td></tr>
        <tr><td><strong>Requester phone</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Partner name</strong></td><td>${partner.fullName}</td></tr>
        <tr><td><strong>Partner professional ID</strong></td><td>${partner.profileCode}</td></tr>
      </table>
      <p>Please review both members' kundali details and share the report.</p>
    `,
  });
