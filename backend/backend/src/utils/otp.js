// Thin abstraction over an SMS/OTP provider (MSG91, Twilio Verify, etc).
// Swap the internals for a real provider call using OTP_PROVIDER_API_KEY.
const otpStore = new Map(); // phone -> { code, expiresAt }  (use Redis in production)

export const generateAndSendOtp = async (phone) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  // TODO: replace with real SMS provider call
  console.log(`[OTP] Sending ${code} to ${phone}`);
  return true;
};

export const verifyOtp = (phone, code) => {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  const isValid = entry.code === code;
  if (isValid) otpStore.delete(phone);
  return isValid;
};
