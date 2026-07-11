import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Lock, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { api } from "../lib/axios";

gsap.registerPlugin(useGSAP);

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError("");
    if (!token) {
      setServerError("This reset link is missing its token. Please request a new one.");
      return;
    }
    try {
      await api.post("/auth/reset-password", { token, password: values.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "This reset link is invalid or has expired.");
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

            {done ? (
              <div className="animate-fade space-y-5 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#7A1E3A]/08">
                  <CheckCircle2 size={24} className="text-[#7A1E3A]" />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Password reset</h1>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Redirecting you to login...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h1 className="animate-stagger text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
                    Set a new password
                  </h1>
                  <p className="animate-stagger text-xs text-[#6B7280]">
                    Choose a strong password you haven't used before.
                  </p>
                </div>

                {!token && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#7A1E3A]/10 bg-[#7A1E3A]/05 p-3.5 text-xs text-[#7A1E3A] font-medium animate-fade">
                    <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      This link is missing a reset token.{" "}
                      <Link to="/forgot-password" className="underline font-bold">
                        Request a new one
                      </Link>
                      .
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      New password
                    </label>
                    <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                      <Lock className="input-icon absolute left-4 text-[#888888]" size={16} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-black/20 outline-none"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-[#7A1E3A] font-semibold animate-fade">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Confirm password
                    </label>
                    <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                      <Lock className="input-icon absolute left-4 text-[#888888]" size={16} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-black/20 outline-none"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-[#7A1E3A] font-semibold animate-fade">
                        {errors.confirmPassword.message}
                      </p>
                    )}
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
                    {isSubmitting ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
