import type { WizardFormData } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Sparkle, CheckCircle2 } from "lucide-react";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

// 1. PRODUCTION-READY MATRICES (ALPHABETIZED & PREMIUM PLATFORM CALIBRATED)
const degreesList = [
  "High School", "Diploma", "ITI", "BA", "B.Com", "B.Sc", "BBA", "BCA", "B.E.", "B.Tech", 
  "B.Pharm", "BDS", "MBBS", "LLB", "MA", "M.Com", "M.Sc", "MBA", "MCA", "M.E.", "M.Tech", 
  "CA", "CS", "ICWA", "IAS", "IPS", "PCS", "PhD", "Other Professional Degrees"
].sort();

const occupationsList = [
  "Advocate", "Air Force", "Architect", "Army", "Banker", "Business Owner", "Chartered Accountant", 
  "Civil Engineer", "Cloud Engineer", "Cyber Security Engineer", "Data Scientist", "Dentist", 
  "Designer", "DevOps Engineer", "Doctor", "Electrical Engineer", "Entrepreneur", "Farmer", 
  "Freelancer", "Government Employee", "Homemaker", "Mechanical Engineer", "Navy", "Nurse", 
  "Pharmacist", "Police", "Private Employee", "Product Manager", "Professor", "Public Sector Employee", 
  "Researcher", "Retired", "Scientist", "Self Employed", "Software Engineer", "Student", 
  "Teacher", "UI/UX Designer", "Other"
].sort();

const incomeRanges = [
  "No Income",
  "Below ₹1 Lakh",
  "₹1–2 Lakh",
  "₹2–3 Lakh",
  "₹3–5 Lakh",
  "₹5–7 Lakh",
  "₹7–10 Lakh",
  "₹10–15 Lakh",
  "₹15–20 Lakh",
  "₹20–30 Lakh",
  "₹30–50 Lakh",
  "₹50–75 Lakh",
  "₹75 Lakh–1 Crore",
  "Above ₹1 Crore"
];

// Contextual Quick Suggestions for Frictionless Pill Click Interactions
const suggestions = {
  degrees: ["B.Tech", "M.Tech", "MBA", "MBBS", "CA", "PhD"],
  fields: ["Computer Science", "Data Science", "Medicine", "Finance & Accounts", "Mechanical Eng."],
  colleges: ["NIT Hamirpur", "HPU Shimla", "IIT Mandi", "UIIT Shimla", "Chitkara University"],
  occupations: ["Software Engineer", "Government Employee", "Doctor", "Banker", "Teacher"],
  companies: ["H.P. Government", "Central Government", "TCS", "Infosys", "Deloitte", "Self-Employed"]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const blockVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
};

export const Step3Education = ({ data, update, errors }: Props) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 w-full font-sans antialiased text-[#1A1A1A]"
    >
      {/* IMMERSIVE STEP CONTEXT */}
      <div className="relative w-full pb-2">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B1E3D] bg-[#7B1E3D]/5 px-4 py-1.5 rounded-full border border-[#7B1E3D]/10">
            <GraduationCap size={12} className="text-[#C89A45]" /> PART 03 / PROFESSIONAL CREDENTIALS
          </span>
          <StepHeader 
            title="Education & Career" 
            subtitle="Help families understand your intellectual milestones, professional trajectory, and lifestyle compatibility parameters." 
          />
        </div>
      </div>

      {/* FULL RESPONSIVE 12-COLUMN WORKSPACE STAGE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
        
        {/* EXTENDED FORMS WORKSPACE (9 of 12 Columns) */}
        <div className="xl:col-span-9 space-y-12 w-full">
          
          {/* SECTION I: INTELLECTUAL TRACK */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECE8E2] pb-3">
              <GraduationCap size={16} className="text-[#C89A45]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C89A45]">Academic Architecture</h3>
            </div>

            <motion.div variants={blockVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Highest Degree */}
              <div className={`rounded-2xl border bg-white p-6 transition-all duration-300 shadow-sm ${
                errors["education.degree"] ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
              }`}>
                <SelectField
                  label="Highest Degree" 
                  required 
                  placeholder="Select Qualification"
                  value={data.education.degree} 
                  error={errors["education.degree"]}
                  options={degreesList.map((deg) => ({ value: deg, label: deg }))}
                  onChange={(e) => update({ education: { ...data.education, degree: e.target.value } })}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {suggestions.degrees.map((deg) => (
                    <button
                      key={deg} type="button"
                      onClick={() => update({ education: { ...data.education, degree: deg } })}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all border ${
                        data.education.degree === deg ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/20 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      {deg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field of Study */}
              <div className="rounded-2xl border border-[#ECE8E2] bg-white p-6 transition-all duration-300 shadow-sm focus-within:border-[#7B1E3D]">
                <TextField
                  label="Field of Study" placeholder="e.g. Computer Science"
                  value={data.education.field}
                  onChange={(e) => update({ education: { ...data.education, field: e.target.value } })}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {suggestions.fields.slice(0, 4).map((fld) => (
                    <button
                      key={fld} type="button"
                      onClick={() => update({ education: { ...data.education, field: fld } })}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all border ${
                        data.education.field === fld ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/20 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      {fld}
                    </button>
                  ))}
                </div>
              </div>

              {/* College / University */}
              <div className="rounded-2xl border border-[#ECE8E2] bg-white p-6 transition-all duration-300 shadow-sm focus-within:border-[#7B1E3D] md:col-span-2 lg:col-span-1">
                <TextField
                  label="College / University" placeholder="e.g. NIT Hamirpur"
                  value={data.education.college}
                  onChange={(e) => update({ education: { ...data.education, college: e.target.value } })}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {suggestions.colleges.slice(0, 3).map((col) => (
                    <button
                      key={col} type="button"
                      onClick={() => update({ education: { ...data.education, college: col } })}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all border ${
                        data.education.college === col ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/20 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* SECTION II: PROFESSIONAL CAREER TRACK */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECE8E2] pb-3">
              <Briefcase size={16} className="text-[#C89A45]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C89A45]">Career Architecture</h3>
            </div>

            <motion.div variants={blockVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Occupation */}
              <div className={`rounded-2xl border bg-white p-6 transition-all duration-300 shadow-sm ${
                errors["occupation.title"] ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
              }`}>
                <SelectField
                  label="Current Occupation" 
                  required 
                  placeholder="Select Occupation"
                  value={data.occupation.title} 
                  error={errors["occupation.title"]}
                  options={occupationsList.map((occ) => ({ value: occ, label: occ }))}
                  onChange={(e) => update({ occupation: { ...data.occupation, title: e.target.value } })}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {suggestions.occupations.slice(0, 4).map((occ) => (
                    <button
                      key={occ} type="button"
                      onClick={() => update({ occupation: { ...data.occupation, title: occ } })}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all border ${
                        data.occupation.title === occ ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/20 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Organization */}
              <div className="rounded-2xl border border-[#ECE8E2] bg-white p-6 transition-all duration-300 shadow-sm focus-within:border-[#7B1E3D]">
                <TextField
                  label="Company / Organisation" placeholder="e.g. Infosys"
                  value={data.occupation.company}
                  onChange={(e) => update({ occupation: { ...data.occupation, company: e.target.value } })}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {suggestions.companies.slice(0, 4).map((cmp) => (
                    <button
                      key={cmp} type="button"
                      onClick={() => update({ occupation: { ...data.occupation, company: cmp } })}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all border ${
                        data.occupation.company === cmp ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/20 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      {cmp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Income Select Range */}
              <div className="rounded-2xl border border-[#ECE8E2] bg-white p-6 transition-all duration-300 shadow-sm focus-within:border-[#7B1E3D] md:col-span-2 lg:col-span-1">
                <SelectField
                  label="Annual Income Context" 
                  placeholder="Select Income Range"
                  value={data.occupation.annualIncomeRange}
                  options={incomeRanges.map((r) => ({ value: r, label: r }))}
                  onChange={(e) => update({ occupation: { ...data.occupation, annualIncomeRange: e.target.value } })}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {incomeRanges.slice(4, 8).map((range) => (
                    <button
                      key={range} type="button"
                      onClick={() => update({ occupation: { ...data.occupation, annualIncomeRange: range } })}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all border ${
                        data.occupation.annualIncomeRange === range ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/20 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* COMPACT CONTEXTUAL BAR INDICES (3 of 12 Columns) */}
        <div className="xl:col-span-3 space-y-6 xl:sticky xl:top-28 w-full">
          <motion.div 
            variants={blockVariants}
            className="rounded-2xl border border-[#ECE8E2] bg-white p-8 space-y-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 h-24 w-24 bg-[#C89A45]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2 text-[#C89A45]">
              <Sparkle size={16} className="fill-current" />
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#1A1A1A]">Professional Index</h4>
            </div>
            
            <p className="text-xs leading-relaxed text-zinc-500 font-medium tracking-wide">
              Educational background and corporate commitments indicate long-term socio-economic compatibility and structural alignment.
            </p>

            <hr className="border-[#ECE8E2]" />

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">System Parameters</h5>
              <ul className="space-y-3.5 text-xs text-zinc-600 font-medium leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-full bg-[#7B1E3D]/10 p-0.5 text-[#7B1E3D] shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <span>Quick tags allow you to bypass dropdown searching while matching common regional institutions.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};