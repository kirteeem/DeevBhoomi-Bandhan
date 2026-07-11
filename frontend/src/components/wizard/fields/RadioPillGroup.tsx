import { motion } from "framer-motion";
import { FieldShell } from "./FieldShell";

interface Option { 
  value: string; 
  label: string; 
}

interface RadioPillGroupProps {
  label: string; 
  required?: boolean; 
  error?: string;
  options: Option[]; 
  value: string; 
  onChange: (v: string) => void; 
  columns?: number;
}

/** Custom radio buttons rendered as an animated pill group (replaces ugly native radios). */
export const RadioPillGroup = ({
  label, 
  required, 
  error, 
  options, 
  value, 
  onChange,
  // Removed the unused 'columns' assignment from destructuring to clear TS6133 error
}: RadioPillGroupProps) => (
  <FieldShell label={label} required={required} error={error}>
    {/* Clean, robust layout system that wraps seamlessly on mobile and stays uniform on desktop */}
    <div className="flex flex-wrap items-center gap-3 w-full mt-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`group relative overflow-hidden rounded-xl border px-5 py-3 text-xs font-bold transition-all duration-200 outline-none select-none min-w-[130px] ${
              active 
                ? "border-[#7B1E3D] text-white shadow-sm" 
                : "border-[#ECE8E2] bg-white text-[#1A1A1A] hover:bg-[#FAF8F5] hover:border-neutral-400"
            }`}
          >
            {/* Smooth sliding selection capsule using your exact corporate brand accent color */}
            {active && (
              <motion.span
                layoutId={`pill-${label}`}
                className="absolute inset-0 bg-[#7B1E3D]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            {/* Text remains strictly readable on top of layout states */}
            <span className={`relative z-10 transition-colors duration-150 ${
              active ? "text-white" : "text-[#1A1A1A] group-hover:text-black"
            }`}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  </FieldShell>
);