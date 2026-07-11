import type { WizardFormData } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { TextField } from "../fields/TextField";
import { TextAreaField } from "../fields/TextAreaField";
import { RadioPillGroup } from "../fields/RadioPillGroup";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Sparkles, Heart, Calendar, Ruler, CheckCircle2, Sparkle, PenTool, PhoneCall, ShieldCheck
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const blockVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
};

const calculateAge = (dobString: string): number | null => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const Step1Personal = ({ data, update, errors }: Props) => {
  const calculatedAge = calculateAge(data.dateOfBirth);
  const { user } = useAuth();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 w-full font-sans antialiased text-[#1A1A1A]"
    >
      {/* INTRO AREA WIDENED */}
      <div className="relative w-full pb-2">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B1E3D] bg-[#7B1E3D]/5 px-4 py-1.5 rounded-full border border-[#7B1E3D]/10">
            <User size={12} className="text-[#C89A45]" /> PART 01 / PROFILE CORE IDENTITY
          </span>
          <StepHeader 
            title="Tell us about yourself." 
            subtitle="Please share your biographical properties and foundational parameters below to calibrate our recommendation system." 
          />
        </div>
      </div>

      {/* MULTI-COLUMN INTEGRATED ONBOARDING GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
        
        {/* WIDE CONTENT GRID AREA (9 of 12 Columns) */}
        <div className="xl:col-span-9 space-y-8 w-full">

          {/* READ-ONLY ACCOUNT PHONE — sourced from signup/OTP login, never
              editable here so every number on the platform stays genuine. */}
          <motion.div variants={blockVariants} className="flex items-center gap-4 rounded-2xl border border-[#ECE8E2] bg-[#FAF8F5] p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7B1E3D]/10 text-[#7B1E3D]">
              <PhoneCall size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Registered Mobile Number</p>
              <p className="truncate text-sm font-bold text-[#1A1A1A]">{user?.phone || "—"}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-[#2E6F57]">
              <ShieldCheck size={14} />
              {user?.isPhoneVerified ? "Verified at signup" : "Locked to your account"}
            </div>
          </motion.div>
          
          {/* MULTI-FIELD GRID ROW FOR LARGE WORKSPACE */}
          <motion.div variants={blockVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Extended Date of Birth Component Block */}
            <div className={`relative rounded-2xl border bg-white p-8 transition-all duration-300 shadow-sm group ${
              errors.dateOfBirth ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
            }`}>
              <div className="absolute top-8 right-8 text-zinc-300 group-focus-within:text-[#7B1E3D] transition-colors">
                <Calendar size={18} />
              </div>
              <div className="space-y-1">
                <TextField
                  label="Date of Birth" 
                  type="date" 
                  required
                  value={data.dateOfBirth} 
                  error={errors.dateOfBirth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => update({ dateOfBirth: e.target.value })}
                />
              </div>
              <AnimatePresence>
                {calculatedAge !== null && !errors.dateOfBirth && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#2E6F57]/5 px-3 py-1.5 text-xs font-bold text-[#2E6F57] border border-[#2E6F57]/15"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2E6F57] animate-pulse" />
                    Age: {calculatedAge} Years Old
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Extended Height Card Block */}
            <div className={`relative rounded-2xl border bg-white p-8 transition-all duration-300 shadow-sm group ${
              errors.heightCm ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
            }`}>
              <div className="absolute top-8 right-8 text-zinc-300 group-focus-within:text-[#7B1E3D] transition-colors">
                <Ruler size={18} />
              </div>
              <div className="space-y-1">
                <TextField
                  label="Height (cm)" 
                  type="number" 
                  required
                  placeholder="e.g. 172" 
                  value={data.heightCm} 
                  error={errors.heightCm}
                  onChange={(e) => update({ heightCm: e.target.value === "" ? "" : Number(e.target.value) })}
                />
              </div>
              {data.heightCm ? (
                <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#2E6F57]/5 px-3 py-1.5 text-xs font-bold text-[#2E6F57] border border-[#2E6F57]/15">
                  Metric: {Math.floor(Number(data.heightCm) / 30.48)}&apos;{Math.round((Number(data.heightCm) % 30.48) / 2.54)}&quot;
                </div>
              ) : (
                <div className="mt-6 text-xs text-zinc-400 font-medium">Measured barefooted</div>
              )}
            </div>

            {/* Integrated Astrological Card Block */}
            <div className="rounded-2xl border border-[#ECE8E2] bg-white p-8 shadow-sm md:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C89A45]/10 text-[#C89A45]">
                  <Sparkles size={14} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Astrological Profile</span>
              </div>
              <RadioPillGroup
                label="Manglik Dosha" 
                value={data.manglik}
                onChange={(v) => update({ manglik: v as WizardFormData["manglik"] })}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "dont_know", label: "Don't Know" },
                ]}
              />
            </div>
          </motion.div>

          {/* WIDESCREEN MARITAL OPTION FRAMEWORK */}
          <motion.div 
            variants={blockVariants} 
            className={`rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 ${
              errors.maritalStatus ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2]'
            }`}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7B1E3D]/5 text-[#7B1E3D]">
                <Heart size={14} className="fill-current" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Relationship Profile Framework</span>
            </div>
            <RadioPillGroup
              label="Marital Status" 
              required 
              error={errors.maritalStatus}
              value={data.maritalStatus}
              onChange={(v) => update({ maritalStatus: v as WizardFormData["maritalStatus"] })}
              options={[
                { value: "never_married", label: "Never Married" },
                { value: "divorced", label: "Divorced" },
                { value: "widowed", label: "Widowed" },
                { value: "awaiting_divorce", label: "Awaiting Divorce" },
              ]}
            />
          </motion.div>

          {/* WIDESCREEN NOTION/MEDIUM STYLE EDITING CONTAINER */}
          <motion.div 
            variants={blockVariants} 
            className="rounded-2xl border border-[#ECE8E2] bg-white p-10 shadow-sm group transition-all duration-300 focus-within:ring-1 focus-within:ring-[#7B1E3D] focus-within:border-[#7B1E3D]"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#ECE8E2] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-focus-within:bg-[#7B1E3D]/5 group-focus-within:text-[#7B1E3D]">
                  <PenTool size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Personal Biography Statement</span>
                  <p className="text-xs text-zinc-400 font-medium">Compose an authentic window into your daily life.</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-500 bg-zinc-50 px-3 py-1 rounded-lg border border-[#ECE8E2]">
                {data.aboutMe.length} / 1500 characters
              </span>
            </div>
            
            <div className="mt-4">
              <TextAreaField
                label="Express your story & personal ethos" 
                rows={6} 
                maxLength={1500}
                placeholder="Share your primary personal values, cultural worldview, career trajectory details, and a brief summary of your perfect companion..."
                value={data.aboutMe} 
                onChange={(e) => update({ aboutMe: e.target.value })}
              />
            </div>
          </motion.div>

        </div>

        {/* COMPACT SIDE BAR TIPS CONTEXT BLOCK (3 of 12 Columns) */}
        <div className="xl:col-span-3 space-y-6 xl:sticky xl:top-28 w-full">
          <motion.div 
            variants={blockVariants}
            className="rounded-2xl border border-[#ECE8E2] bg-white p-8 space-y-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 h-24 w-24 bg-[#C89A45]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2 text-[#C89A45]">
              <Sparkle size={16} className="fill-current" />
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#1A1A1A]">Curated Verification</h4>
            </div>
            
            <p className="text-xs leading-relaxed text-zinc-500 font-medium">
              Matches are systematically derived from these absolute metrics. Ensure your inputs correspond exactly with verifiable legal documents.
            </p>

            <hr className="border-[#ECE8E2]" />

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Profile Content Tips</h5>
              <ul className="space-y-3.5 text-xs text-zinc-600 font-medium leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-full bg-[#7B1E3D]/10 p-0.5 text-[#7B1E3D] shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <span>Highlight your cultural outlook and primary everyday lifestyle values.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-full bg-[#7B1E3D]/10 p-0.5 text-[#7B1E3D] shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <span>Mention what professional growth and a premium balance mean to you.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};