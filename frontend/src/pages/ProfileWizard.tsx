import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, MapPin, GraduationCap, Users, Sparkles, Heart, UsersRound, Camera, ClipboardCheck,
  ChevronRight, ChevronLeft, Save, Sparkle, CheckCircle2
} from "lucide-react";
import { fetchMyProfile, updateMyProfile } from "../lib/profileApi";
import { profileToWizardData, profileToPhotos } from "../lib/wizardMapping";
import type { WizardFormData, ProfilePhoto } from "../types/wizard";
import { emptyWizardData } from "../types/wizard";

import { Step1Personal } from "../components/wizard/steps/Step1Personal";
import { Step2Location } from "../components/wizard/steps/Step2Location";
import { Step3Education } from "../components/wizard/steps/Step3Education";
import { Step4Family } from "../components/wizard/steps/Step4Family";
import { Step5Religion } from "../components/wizard/steps/Step5Religion";
import { Step6Lifestyle } from "../components/wizard/steps/Step6Lifestyle";
import { Step7PartnerPreference } from "../components/wizard/steps/Step7PartnerPreference";
import { Step8Photos } from "../components/wizard/steps/Step8Photos";
import { Step9Review } from "../components/wizard/steps/Step9Review";

const STEPS = [
  { id: 0, title: "Personal Info", icon: User, desc: "Your identity", time: "1 min" },
  { id: 1, title: "Living Location", icon: MapPin, desc: "Where you reside", time: "1 min" },
  { id: 2, title: "Career & Education", icon: GraduationCap, desc: "Professional background", time: "2 mins" },
  { id: 3, title: "Family Heritage", icon: Users, desc: "Roots & family values", time: "2 mins" },
  { id: 4, title: "Spiritual Values", icon: Sparkles, desc: "Beliefs & traditions", time: "1 min" },
  { id: 5, title: "Lifestyle Choices", icon: Heart, desc: "Habits & interests", time: "1 min" },
  { id: 6, title: "Partner Match", icon: UsersRound, desc: "Preferences", time: "2 mins" },
  { id: 7, title: "Visual Portrait", icon: Camera, desc: "Photos & gallery", time: "1 min" },
  { id: 8, title: "Curated Review", icon: ClipboardCheck, desc: "Final preview", time: "1 min" },
];

const validateStep = (step: number, data: WizardFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!data.heightCm) errors.heightCm = "Height is required";
    if (!data.maritalStatus) errors.maritalStatus = "Please select your marital status";
  }
  if (step === 1) {
    if (!data.district) errors.district = "Please select your native district";
    if (!data.city) errors.city = "City / town is required";
    if (!data.address || data.address.trim().length < 10) {
      errors.address = "Please enter your full residential address";
    }
  }
  return errors;
};

export const ProfileWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [furthestReached, setFurthestReached] = useState(0);
  const [data, setData] = useState<WizardFormData>(emptyWizardData);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const profile = await fetchMyProfile();
        setData(profileToWizardData(profile));
        setPhotos(profileToPhotos(profile));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const update = (patch: Partial<WizardFormData>) => setData((prev) => ({ ...prev, ...patch }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const goTo = (target: number) => {
    if (target > furthestReached + 1) return;
    setDirection(target > step ? 1 : -1);
    setStep(target);
    setFurthestReached((f) => Math.max(f, target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = async () => {
    const stepErrors = validateStep(step, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (step === STEPS.length - 1) {
      setIsSubmitting(true);
      try {
        await updateMyProfile(data);
        showToast("Profile submitted successfully 🎉");
        setTimeout(() => navigate("/dashboard"), 1200);
      } catch (err: any) {
        showToast(err?.response?.data?.message || "Something went wrong.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setDirection(1);
    const nextStep = step + 1;
    setStep(nextStep);
    setFurthestReached((f) => Math.max(f, nextStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await updateMyProfile(data);
      showToast("Progress draft saved securely");
    } catch {
      showToast("Couldn't save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] text-[#1A1A1A]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="mb-4 text-[#7B1E3D]">
          <Sparkle className="h-10 w-10 fill-current" />
        </motion.div>
      </div>
    );
  }

  const stepProps = { data, update, errors };
  const percentageComplete = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-body text-[#1A1A1A] selection:bg-[#7B1E3D]/10 selection:text-[#7B1E3D]">
      
      {/* MINIMALIST HEADER PROGRESS LINE */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/80 backdrop-blur-md">
        <div className="h-[3px] w-full bg-[#ECE8E2]">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#7B1E3D] via-[#C89A45] to-[#2E6F57]" 
            animate={{ width: `${percentageComplete}%` }} 
            transition={{ duration: 0.3 }} 
          />
        </div>
      </header>

      {/* FULL RESPONSIVE VIEWPORT STAGE */}
      <main className="mx-auto w-full max-w-[1800px] px-6 xl:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 xl:gap-14 items-start">
          
          {/* SLIMMED HIGH-END JOURNEY ROADMAP */}
          <aside className="lg:col-span-1 rounded-2xl border border-[#ECE8E2] bg-white p-4 shadow-sm hidden lg:block sticky top-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-2">Journey Roadmap</p>
            <nav className="space-y-1">
              {STEPS.map((s, idx) => {
                const isCompleted = idx < step;
                const isActive = idx === step;
                const isLocked = idx > furthestReached + 1;

                return (
                  <button
                    key={s.id}
                    onClick={() => !isLocked && goTo(idx)}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl transition-all ${
                      isActive 
                        ? "bg-[#7B1E3D]/5 text-[#7B1E3D] font-semibold border-l-4 border-[#7B1E3D] pl-3 shadow-sm" 
                        : isCompleted 
                        ? "text-[#2E6F57] hover:bg-[#2E6F57]/5" 
                        : "text-zinc-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-[#7B1E3D] text-white" : isCompleted ? "bg-[#2E6F57] text-white" : "bg-zinc-100 text-zinc-400"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-xs truncate tracking-tight">{s.title}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* EXTENDED WORKSPACE PANELS */}
          <section className="lg:col-span-4 flex flex-col min-h-[72vh] justify-between">
            <div className="w-full">
              {/* Contextual Header Group */}
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#ECE8E2] pb-8">
                <div>
                  <span className="inline-flex items-center rounded-full bg-[#2E6F57]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#2E6F57] uppercase mb-3">
                    Step 0{step + 1} of 09
                  </span>
                  <h1 className="font-display text-3xl xl:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
                    {STEPS[step].title}
                  </h1>
                </div>
                
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#ECE8E2] bg-white px-5 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 active:scale-95 shadow-sm self-start md:self-end"
                >
                  <Save className="h-4 w-4 text-[#C89A45]" />
                  {isSaving ? "Saving..." : "Save Progress Draft"}
                </button>
              </div>

              {/* Dynamic Step View Port Area */}
              <div className="w-full">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: direction * 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-full"
                  >
                    {step === 0 && <Step1Personal {...stepProps} />}
                    {step === 1 && <Step2Location {...stepProps} />}
                    {step === 2 && <Step3Education {...stepProps} />}
                    {step === 3 && <Step4Family {...stepProps} />}
                    {step === 4 && <Step5Religion {...stepProps} />}
                    {step === 5 && <Step6Lifestyle {...stepProps} />}
                    {step === 6 && <Step7PartnerPreference {...stepProps} />}
                    
                    {step === 7 && (
                      <Step8Photos 
                        data={data} 
                        updateData={update} 
                        existingPhotos={photos as any[]} 
                        onPhotosChange={setPhotos as any} 
                      />
                    )}
                    
                    {step === 8 && <Step9Review data={data} photos={photos} onEditStep={goTo} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* EXPANDED NAVIGATION BUTTON BAR */}
            <div className="mt-16 flex items-center justify-between border-t border-[#ECE8E2] pt-8 bg-[#FAF8F5]/50 backdrop-blur-sm sticky bottom-0 py-4 z-10 w-full">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-[#ECE8E2] bg-white px-6 py-3.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-25 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Step
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7B1E3D] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#631831] shadow-md transition-all active:scale-[0.99]"
              >
                {step === STEPS.length - 1 ? (
                  isSubmitting ? "Finalizing..." : "Complete & Publish Portfolio"
                ) : (
                  <>
                    Continue Journey
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Floating Alerts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 rounded-2xl bg-[#1A1A1A] px-6 py-4 text-xs font-semibold text-[#FAF8F5] shadow-2xl flex items-center gap-3 border border-zinc-800"
          >
            <div className="h-2 w-2 rounded-full bg-[#2E6F57] animate-ping" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};