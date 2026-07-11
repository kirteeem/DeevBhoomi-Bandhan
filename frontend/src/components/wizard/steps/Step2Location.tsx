import type { WizardFormData } from "../../../types/wizard";
import { HP_DISTRICTS } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { TextField } from "../fields/TextField";
import { TextAreaField } from "../fields/TextAreaField";
import { SelectField } from "../fields/SelectField";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, Compass, Sparkle, CheckCircle2, Home } from "lucide-react";

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

export const Step2Location = ({ data, update, errors }: Props) => {
  // Generate options including a premium fallback "Other" selection
  const districtOptions = [
    ...HP_DISTRICTS.map((d) => ({ value: d, label: d })),
    { value: "Other", label: "Other / Outside Himachal" }
  ];

  // Quick aesthetic suggestion badges to let users auto-fill with a touch interaction
  const popularTownSuggestions = ["Shimla", "Dharamshala", "Manali", "Mandi", "Solan", "Kangra"];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 w-full font-sans antialiased text-[#1A1A1A]"
    >
      {/* IMMERSIVE HEADER SECTION */}
      <div className="relative w-full pb-2">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B1E3D] bg-[#7B1E3D]/5 px-4 py-1.5 rounded-full border border-[#7B1E3D]/10">
            <MapPin size={12} className="text-[#C89A45]" /> PART 02 / GEOGRAPHICAL ANCHOR
          </span>
          <StepHeader 
            title="Where is your family based?" 
            subtitle="Geographic matching plays a foundational role in regional lineages. Declare your native origins and operational residence." 
          />
        </div>
      </div>

      {/* FULL VIEWPORT WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
        
        {/* ENHANCED CONTENT REGION (9 of 12 Columns) */}
        <div className="xl:col-span-9 space-y-8 w-full">
          
          {/* GEOGRAPHY DYNAMIC DATA ROW */}
          <motion.div variants={blockVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Extended District Dropdown Component Panel */}
            <div className={`relative rounded-2xl border bg-white p-8 transition-all duration-300 shadow-sm group ${
              errors.district ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
            }`}>
              <div className="absolute top-8 right-8 text-zinc-300 group-focus-within:text-[#7B1E3D] transition-colors">
                <Compass size={18} />
              </div>
              <div className="space-y-1">
                <SelectField
                  label="Native District" 
                  required 
                  placeholder="Select district"
                  value={data.district} 
                  error={errors.district}
                  options={districtOptions}
                  onChange={(e) => {
                    const val = e.target.value;
                    update({ 
                      district: val,
                      // Reset custom input if changing away from Other
                      ...(val !== "Other" && { customDistrict: "" }) 
                    });
                  }}
                />
              </div>
            </div>

            {/* High-Fidelity City / Town Input with Dynamic Touch Suggestions */}
            <div className={`relative rounded-2xl border bg-white p-8 transition-all duration-300 shadow-sm group ${
              errors.city ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
            }`}>
              <div className="absolute top-8 right-8 text-zinc-300 group-focus-within:text-[#7B1E3D] transition-colors">
                <MapPin size={18} />
              </div>
              <div className="space-y-1">
                <TextField
                  label="City / Town / Village" 
                  required 
                  placeholder="e.g. Shimla"
                  value={data.city} 
                  error={errors.city}
                  onChange={(e) => update({ city: e.target.value })}
                />
              </div>
              
              {/* Micro Interaction: Quick Selection Pills */}
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Regional Suggestions</p>
                <div className="flex flex-wrap gap-1.5">
                  {popularTownSuggestions.map((town) => (
                    <button
                      key={town}
                      type="button"
                      onClick={() => update({ city: town })}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        data.city === town
                          ? "bg-[#7B1E3D]/10 text-[#7B1E3D] border-[#7B1E3D]/30 font-semibold"
                          : "bg-zinc-50 text-zinc-600 border-[#ECE8E2] hover:bg-zinc-100"
                      }`}
                    >
                      {town}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Immersive Current Residence Country Panel */}
            <div className="relative rounded-2xl border border-[#ECE8E2] bg-white p-8 transition-all duration-300 shadow-sm group focus-within:border-[#7B1E3D]">
              <div className="absolute top-8 right-8 text-zinc-300 group-focus-within:text-[#7B1E3D] transition-colors">
                <Globe size={18} />
              </div>
              <div className="space-y-1">
                <TextField
                  label="Current Residence Country"
                  placeholder="e.g. India"
                  value={data.currentResidenceCountry || ""}
                  onChange={(e) => update({ currentResidenceCountry: e.target.value })}
                />
              </div>
              <div className="mt-4 text-[11px] text-zinc-400 font-medium">Declare passport/visa matching domain</div>
            </div>

          </motion.div>

          {/* FULL RESIDENTIAL ADDRESS — required so matched families can be
              verified and (once a member unlocks your contact details) can
              actually reach you. Kept separate from district/city, which are
              always public. */}
          <motion.div variants={blockVariants} className="w-full">
            <div className={`relative rounded-2xl border bg-white p-8 transition-all duration-300 shadow-sm group ${
              errors.address ? 'border-red-200 bg-red-50/10' : 'border-[#ECE8E2] focus-within:border-[#7B1E3D]'
            }`}>
              <div className="absolute top-8 right-8 text-zinc-300 group-focus-within:text-[#7B1E3D] transition-colors">
                <Home size={18} />
              </div>
              <div className="space-y-1 max-w-2xl">
                <TextAreaField
                  label="Full Residential Address"
                  required
                  rows={3}
                  placeholder="House no., street, locality, pincode"
                  value={data.address}
                  error={errors.address}
                  hint="Only shared with members who unlock your contact details (Premium, or once your interest is mutually accepted) — never shown publicly."
                  onChange={(e) => update({ address: e.target.value })}
                />
              </div>
            </div>
          </motion.div>

          {/* RE-BALANCED CONDITIONAL INPUT FOR 'OTHER' DISTRICT */}
          <AnimatePresence mode="wait">
            {data.district === "Other" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="rounded-2xl border border-[#C89A45]/30 bg-gradient-to-r from-white to-[#FAF8F5] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-2 w-2 rounded-full bg-[#C89A45]" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Specify Custom Location Domain</h4>
                      <p className="text-xs text-zinc-400 font-medium">State your global ancestral district location context below.</p>
                    </div>
                  </div>
                  <div className="max-w-xl">
                    <TextField
                      label="Specify Custom District / State Location"
                      required
                      placeholder="e.g. Kangra (Migrated to Delhi) or Dehradun, UK"
                      value={(data as any).customDistrict || ""}
                      onChange={(e) => update({ customDistrict: e.target.value } as any)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* SIDE BAR TRADITIONAL VERIFICATION MODULE (3 of 12 Columns) */}
        <div className="xl:col-span-3 space-y-6 xl:sticky xl:top-28 w-full">
          <motion.div 
            variants={blockVariants}
            className="rounded-2xl border border-[#ECE8E2] bg-white p-8 space-y-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 h-24 w-24 bg-[#C89A45]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2 text-[#C89A45]">
              <Sparkle size={16} className="fill-current" />
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#1A1A1A]">Curated Heritage</h4>
            </div>
            
            <p className="text-xs leading-relaxed text-zinc-500 font-medium tracking-wide">
              Matrimonial unions thrive on cross-regional affinity tracking. Declaring accurate location clusters values cultural convergence.
            </p>

            <hr className="border-[#ECE8E2]" />

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Location Anchoring</h5>
              <ul className="space-y-3.5 text-xs text-zinc-600 font-medium leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-full bg-[#7B1E3D]/10 p-0.5 text-[#7B1E3D] shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <span>Use custom fields dynamically if your family line resides outside native boundaries.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};