import { useEffect, useRef } from "react";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fluid pinned tracking on desktop layouts
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top+=80",
        end: "bottom bottom",
        pin: leftSideRef.current,
        pinSpacing: false,
        scrub: 1,
      });

      // Parallax-style continuous growth tracking for the editorial divider line
      gsap.fromTo(
        ".editorial-progress-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative z-20 w-full bg-[#FBF8F3] text-[#241F1C] px-4 sm:px-12 py-32"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
        
        {/* =========================================================================
            LEFT COLUMN: STICKY EDITORIAL PANEL
            ========================================================================= */}
        <div ref={leftSideRef} className="lg:col-span-4 lg:h-[calc(100vh-160px)] flex flex-col justify-between py-4">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[2px] w-6 bg-[#6B1F2A]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#6B1F2A]">The Methodology</span>
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#6B1F2A] tracking-tight leading-[1.1] mb-6">
              A Cultured Approach <br />
              <span className="font-serif italic font-normal text-[#A9792C]">to Matrimony</span>
            </h2>
            
            <p className="text-sm text-[#241F1C]/70 font-sans leading-relaxed max-w-sm">
              We mapped out a traditional lineage system into a high-utility native architecture. Built consciously, avoiding modern chaotic dating metrics.
            </p>
          </div>

          {/* Micro Index Tracker */}
          <div className="hidden lg:flex flex-col gap-3 border-t border-[#6B1F2A]/10 pt-8 mt-12">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#241F1C]/40">System Milestones</div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#6B1F2A]">
              <span>Identity Verification</span>
              <ArrowRight size={12} className="opacity-40" />
              <span>Lineage Filter</span>
              <ArrowRight size={12} className="opacity-40" />
              <span>Unification</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: STORYTELLING TIMELINE MASONRY
            ========================================================================= */}
        <div className="lg:col-span-8 relative pl-6 sm:pl-12">
          
          {/* Asymmetric Timeline Track Line */}
          <div className="absolute left-0 top-4 bottom-4 w-[1px] bg-[#6B1F2A]/10">
            <div 
              className="editorial-progress-line absolute top-0 left-0 w-full h-full bg-[#A9792C] origin-top scale-y-0"
            />
          </div>

          <div className="space-y-28">

            {/* STEP 1: FLOATING INTEGRITY CHIP MIX */}
            <div className="relative group">
              <div className="absolute -left-[31px] sm:-left-[55px] top-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#6B1F2A] text-[10px] font-mono font-bold text-white shadow-md">
                01
              </div>
              
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold tracking-widest text-[#A9792C] uppercase block mb-2">Phase One</span>
                <h3 className="text-2xl sm:text-3xl font-display font-medium text-[#6B1F2A] mb-4">Create Verified Profile</h3>
                <p className="text-sm sm:text-base text-[#241F1C]/70 leading-relaxed mb-6">
                  Quick signup with easy background verification. Add the rest of your documentation whenever you are ready.
                </p>

                <div className="inline-flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-[#6B1F2A]/10 shadow-[0_10px_30px_rgba(107,31,42,0.02)]">
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#241F1C]">Telephonic & ID Checked</div>
                    <div className="text-[#241F1C]/50 text-[11px]">Secure community access standard</div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: SPATIAL NOTION-INSPIRED ACCORDION ROWS */}
            <div className="relative group">
              <div className="absolute -left-[31px] sm:-left-[55px] top-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#6B1F2A] text-[10px] font-mono font-bold text-white shadow-md">
                02
              </div>

              <div className="max-w-2xl">
                <span className="text-[10px] font-bold tracking-widest text-[#A9792C] uppercase block mb-2">Phase Two</span>
                <h3 className="text-2xl sm:text-3xl font-display font-medium text-[#6B1F2A] mb-4">Browse Local Lineages</h3>
                <p className="text-sm sm:text-base text-[#241F1C]/70 leading-relaxed mb-6">
                  Smart filters designed natively to explore profiles across specific districts, gotras, and generational values.
                </p>

                <div className="space-y-2 max-w-md">
                  {[
                    { label: "District Preference", val: "Kangra, Mandi, Shimla", active: true },
                    { label: "Community Heritage", val: "Traditional Devbhoomi Values", active: false }
                  ].map((filter, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#6B1F2A]/5 rounded-lg border border-[#6B1F2A]/5 text-xs">
                      <span className="font-medium text-[#6B1F2A]">{filter.label}</span>
                      <span className="text-[#241F1C]/60 italic font-serif bg-white px-2 py-0.5 rounded shadow-sm">{filter.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: HIGH-CONTRAST GOLDEN RIBBON STRIP */}
            <div className="relative group">
              <div className="absolute -left-[31px] sm:-left-[55px] top-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#A9792C] text-[10px] font-mono font-bold text-white shadow-md">
                03
              </div>

              <div className="max-w-2xl bg-gradient-to-br from-[#6B1F2A] to-[#4A141C] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-lg">
                <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 text-white/[0.03] pointer-events-none text-9xl font-black">
                  ॐ
                </div>
                
                <span className="text-[10px] font-bold tracking-widest text-[#A9792C] uppercase bg-white/10 px-3 py-1 rounded-full border border-white/5 inline-block mb-4">
                  Vedic Sync
                </span>
                <h3 className="text-2xl font-display font-medium mb-3">Authentic Gun Milan</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
                  Get calculated natively using regional astronomical algorithms approved by localized temple pandits.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#A9792C] font-semibold bg-white/5 border border-white/10 rounded-lg p-2.5 w-fit">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Calculates accurate Dashakoota & Ashta-koota aspects instantly</span>
                </div>
              </div>
            </div>

            {/* STEP 4: SEAMLESS MATRIX NETWORK PATTERN */}
            <div className="relative group">
              <div className="absolute -left-[31px] sm:-left-[55px] top-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#6B1F2A] text-[10px] font-mono font-bold text-white shadow-md">
                04
              </div>

              <div className="max-w-2xl">
                <span className="text-[10px] font-bold tracking-widest text-[#A9792C] uppercase block mb-2">Final Phase</span>
                <h3 className="text-2xl sm:text-3xl font-display font-medium text-[#6B1F2A] mb-4">Connect Safe & Securely</h3>
                <p className="text-sm sm:text-base text-[#241F1C]/70 leading-relaxed mb-6">
                  Initiate contact with pristine confidentiality. Move conversations ahead naturally with explicit parent and family consent.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-[#6B1F2A]/10 bg-white p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#A9792C] mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Parental Authorization Required</div>
                      <div className="text-[11px] text-[#241F1C]/50 mt-0.5">Ensures match intentions remain authentic.</div>
                    </div>
                  </div>
                  <div className="border border-[#6B1F2A]/10 bg-white p-4 rounded-xl flex items-start gap-3">
                    <MapPin size={16} className="text-[#A9792C] mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Intra-Valley Logistics</div>
                      <div className="text-[11px] text-[#241F1C]/50 mt-0.5">Tailored specifically around Himalayan terrain networks.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};