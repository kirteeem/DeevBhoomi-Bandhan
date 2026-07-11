import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Smartphone, KeyRound, Sparkles, ShieldAlert, ArrowLeft } from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(useGSAP);

export const LoginOtp = () => {
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const rightFormRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set([".animate-fade", ".animate-stagger"], { opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
      tl.fromTo(rightFormRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1 })
        .to(".animate-fade", { opacity: 1, duration: 0.6, stagger: 0.12 }, "-=0.6")
        .fromTo(".animate-stagger", { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06 }, "-=0.5");
    },
    { scope: pageContainerRef }
  );

  const startCooldown = () => {
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      setServerError("Enter a valid phone number");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/otp/request", { phone: phone.trim() });
      setStep("code");
      startCooldown();
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Could not send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (code.trim().length !== 6) {
      setServerError("Enter the 6-digit code");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { phone: phone.trim(), code: code.trim() });
      loginWithTokens(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={pageContainerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent font-sans antialiased text-[#2D2D2D] px-6 py-24"
    >
      <div className="ambient-glow-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#7A1E3A]/03 blur-[120px] pointer-events-none" />

      <div ref={rightFormRef} className="relative w-full max-w-[420px]">
        <div className="rounded-[24px] border border-black/[0.04] bg-white/80 p-8 shadow-xl shadow-black/[0.01] backdrop-blur-md sm:p-10">
          <div className="space-y-6">
            <div className="animate-fade flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7A1E3A] to-[#c9924a] p-[1px] shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-white">
                  <Sparkles size={14} className="text-[#7A1E3A]" />
                </div>
              </div>
              <span className="font-hindi text-sm font-black tracking-tight text-[#1A1A1A]">देवभूमि बंधन</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="animate-stagger text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
                {step === "phone" ? "Log in with OTP" : "Enter verification code"}
              </h1>
              <p className="animate-stagger text-xs text-[#6B7280]">
                {step === "phone"
                  ? "We'll text you a one-time code to sign in."
                  : `Code sent to ${phone}`}
              </p>
            </div>

            {step === "phone" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Phone number
                  </label>
                  <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                    <Smartphone className="input-icon absolute left-4 text-[#888888]" size={16} />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-black/20 outline-none"
                    />
                  </div>
                </div>

                {serverError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#7A1E3A]/10 bg-[#7A1E3A]/05 p-3.5 text-xs text-[#7A1E3A] font-medium animate-fade">
                    <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#7A1E3A] py-3.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-all duration-150 disabled:opacity-50 select-none shadow-md shadow-[#7A1E3A]/10 hover:bg-[#63142B] active:scale-[0.99] mt-2 flex items-center justify-center min-h-[48px]"
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    6-digit code
                  </label>
                  <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                    <KeyRound className="input-icon absolute left-4 text-[#888888]" size={16} />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm tracking-[0.3em] text-[#1A1A1A] placeholder-black/20 outline-none"
                    />
                  </div>
                </div>

                {serverError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#7A1E3A]/10 bg-[#7A1E3A]/05 p-3.5 text-xs text-[#7A1E3A] font-medium animate-fade">
                    <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#7A1E3A] py-3.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-all duration-150 disabled:opacity-50 select-none shadow-md shadow-[#7A1E3A]/10 hover:bg-[#63142B] active:scale-[0.99] mt-2 flex items-center justify-center min-h-[48px]"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Log In"}
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleRequestOtp}
                  className="w-full text-center text-xs font-semibold text-[#7A1E3A] disabled:text-[#9CA3AF] hover:underline"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => (step === "code" ? setStep("phone") : navigate("/login"))}
              className="animate-fade flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-neutral-50 px-4 py-3 text-xs font-bold tracking-wider text-[#2D2D2D] uppercase transition-all duration-200 hover:bg-white hover:border-black/[0.12] active:scale-[0.98]"
            >
              <ArrowLeft size={14} className="text-[#6B7280]" />
              <span>{step === "code" ? "Change phone number" : "Back to login"}</span>
            </button>

            <p className="animate-fade text-center text-xs text-[#6B7280]">
              New here?{" "}
              <Link to="/signup" className="font-bold text-[#7A1E3A] hover:underline ml-1">
                Create your profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
