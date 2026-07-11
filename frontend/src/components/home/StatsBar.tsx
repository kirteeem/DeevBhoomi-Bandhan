import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import page2 from "../../assets/page2.jpeg";
import pagetwo from "../../assets/pagetwo.jpeg";
// Corrected to default import for standard image asset resolution
import Kundali from "../../assets/kundali.png";

const stats = [
  { value: 12000, suffix: "+", label: "Verified Families", desc: "Manual registration & telephone check verification" },
  { value: 3500, suffix: "+", label: "Successful Matches", desc: "Couples who found their lifelong partner across the hills" },
  { value: 100, suffix: "%", label: "Free Kundali Matching", desc: "Accurate Gun Milan algorithms approved by local pandits" },
  { value: 12, suffix: "", label: "Districts Covered", desc: "Operational presence across Himachal & Uttarakhand" },
];

const trustSlides = [
  {
    image: page2,
    title: "Rooted in Devbhoomi Traditions",
    subtitle: "Connecting traditional heritage with safe, community-trusted matching."
  },
  {
    image: pagetwo,
    title: "100% Secure Registrations",
    subtitle: "Every family profile goes through real credential validation."
  }
];

export const StatsBar = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trustSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 py-32 bg-[#FBF8F3] text-[#241F1C] overflow-hidden">
      
      {/* SECTION 1: EDITORIAL OVERSIZED HEADER & HERO STAT */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#6B1F2A]/10 pb-12 mb-20 gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-8 bg-[#A9792C]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#A9792C]">Our Footprint</span>
          </div>
          <h4 className="text-4xl sm:text-6xl font-display font-light text-[#6B1F2A] tracking-tight leading-[1.05]">
            Why Himachali <br />
            <span className="font-serif italic font-normal text-[#A9792C]">Families Trust Us</span>
          </h4>
        </div>
        <div className="max-w-md lg:text-right">
          <p className="text-sm sm:text-base text-[#241F1C]/70 font-sans leading-relaxed">
            We understand Himachali traditions, family values, and the importance of finding the right life partner.
Our platform offers secure profiles, free Kundali matching, and a trusted matrimonial experience.
          </p>
        </div>
      </div>

      {/* COMPOSITION AREA: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-12 items-start">
        
        {/* COLUMN A: THE ASYMMETRIC PINNED SLIDER */}
        <div className="md:col-span-4 flex flex-col gap-6 sticky top-8">
          <div className="relative w-full aspect-square sm:aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#241F1C]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 0.65, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${trustSlides[currentSlide].image})` }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />

            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-20">
              <div className="self-start flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Verification</span>
              </div>

              <div className="text-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display text-lg sm:text-xl font-semibold tracking-wide leading-snug text-white">
                      {trustSlides[currentSlide].title}
                    </h3>
                    <p className="mt-1.5 text-xs text-white/80 font-light leading-relaxed">
                      {trustSlides[currentSlide].subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-1.5 mt-5">
                  {trustSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide ? "w-8 bg-[#A9792C]" : "w-2 bg-white/30"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN B & C: THE HERO METRICS CHIPS & ACCORDION MATRIX */}
        <div className="md:col-span-8 space-y-16">
          
          {/* SECTION 2: ROW (Stat 0 & 1) */}
          <div className="border-t border-[#6B1F2A]/10 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <StatSectionItem {...stats[0]} index={0} />
            <StatSectionItem {...stats[1]} index={1} />
          </div>

          {/* SECTION 3: IMAGE RIBBON BANNER (All text removed) */}
          <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl bg-[#241F1C]">
            <img 
              src={Kundali} 
              alt="Kundali Matching" 
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* SECTION 4: HORIZONTAL SPLIT CHIP PANEL (Stat 3) */}
          <div className="border-b border-[#6B1F2A]/10 pb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full border border-[#A9792C]/30 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                <span className="text-3xl font-display font-bold text-[#6B1F2A]">{stats[3].value}</span>
              </div>
              <div>
                <h5 className="text-lg font-bold tracking-tight text-[#241F1C]">{stats[3].label}</h5>
                <p className="text-xs text-[#241F1C]/60 mt-0.5">{stats[3].desc}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 max-w-xs sm:justify-end">
              {["Shimla", "Kangra", "Mandi", "Solan", "Kullu", "Chamba", "Dehradun"].map((city) => (
                <span key={city} className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-md bg-[#6B1F2A]/5 border border-[#6B1F2A]/10 font-medium text-[#6B1F2A]">
                  {city}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

const StatSectionItem = ({ value, suffix, label, desc, index }: { value: number; suffix: string; label: string; desc: string; index: number }) => {
  const { ref, value: animated } = useCountUp(value);
  
  return (
    <div ref={ref} className="group relative flex flex-col">
      <span className="text-xs font-mono text-[#A9792C]/50 mb-4 font-bold">[0{index + 1}]</span>
      
      <div className="text-5xl font-display font-black tracking-tight text-[#6B1F2A] mb-2 flex items-baseline">
        <span>{animated.toLocaleString()}</span>
        <span className="text-[#A9792C] font-light ml-0.5">{suffix}</span>
      </div>
      
      <h5 className="text-sm font-bold tracking-wide text-[#241F1C] uppercase mb-1">
        {label}
      </h5>
      
      <p className="text-xs text-[#241F1C]/60 leading-relaxed max-w-xs">
        {desc}
      </p>
    </div>
  );
};