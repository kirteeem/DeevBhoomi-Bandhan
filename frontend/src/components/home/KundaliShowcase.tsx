import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import priestImage from "../../assets/priest.jpeg";

export const KundaliShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // GSAP Interactive Magnetic Micro-interaction on Priest Profile Avatar
  useEffect(() => {
    const avatar = avatarRef.current;
    if (!avatar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = avatar.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(avatar, {
        x: x * 0.25,
        y: y * 0.25,
        rotationY: x * 0.05,
        rotationX: -y * 0.05,
        ease: "power2.out",
        duration: 0.4
      });
    };

    const handleMouseLeave = () => {
      gsap.to(avatar, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.3)",
        duration: 0.8
      });
    };

    avatar.addEventListener("mousemove", handleMouseMove);
    avatar.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      avatar.removeEventListener("mousemove", handleMouseMove);
      avatar.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative z-20 w-full overflow-hidden bg-[#FBF8F3] py-24 border-t border-[#6B1F2A]/5">
      
      {/* Absolute Geometric Watermark Mask Background Layer */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#6B1F2A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(169,121,44,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Semantic Headline Typography Focus */}
          <div className="col-span-1 lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1F2A]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#6B1F2A] border border-[#6B1F2A]/10">
              <Sparkles size={12} className="text-[#A9792C]" />
              Our Signature Service
            </span>
            
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#6B1F2A] tracking-tight leading-tight">
              निःशुल्क कुंडली मिलान <br />
              <span className="bg-gradient-to-r from-[#6B1F2A] via-[#A9792C] to-[#6B1F2A] bg-clip-text text-transparent">
                Trusted Vedic Matchmaking
              </span>
            </h2>
            
            <p className="text-base text-[#241F1C]/70 leading-relaxed max-w-xl font-normal">
              Every family deserves guidance they can trust. Get completely free, absolute, and pristine horoscope gun milan evaluations mapped meticulously for families looking for ideal partners across the hills.
            </p>

            {/* Strategic Value Metric Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[#241F1C]/80 font-medium text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#A9792C]" />
                <span>100% Free Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#A9792C]" />
                <span>Traditional Gun Milan Algorithms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#A9792C]" />
                <span>Approved by Local Priests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#A9792C]" />
                <span>Secure & Confidential Data</span>
              </div>
            </div>

            <div className="pt-6">
              <Link 
                to="/kundali" 
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6B1F2A] to-[#8A2B39] px-8 py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(107,31,42,0.2)] hover:opacity-95 transition-opacity duration-300"
              >
                Request Free Kundali Match
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Priest Card with Image Container Frame Layout */}
          <div className="col-span-1 lg:col-span-5 flex justify-center lg:justify-end">
            <div 
              ref={avatarRef}
              className="relative w-full max-w-sm rounded-3xl bg-white border border-[#6B1F2A]/10 p-6 shadow-[0_20px_50px_rgba(107,31,42,0.04)] [perspective:1000px] group"
            >
              <div className="relative w-full h-80 rounded-2xl bg-[#F6F1E8] border border-[#A9792C]/20 overflow-hidden mb-5">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                
                <img 
                  src={priestImage}
                  alt="Pandit Jagat Ram Sharma" 
                 className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-[#A9792C]/30 flex items-center gap-1.5 shadow-sm">
                  <span className="text-sm">🕉️</span>
                  <span className="text-[10px] font-bold text-[#6B1F2A] tracking-wider uppercase">Head Astrologer</span>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <div className="text-xl font-display font-black text-[#6B1F2A]">
                  पंडित जगत राम शर्मा
                </div>
                <div className="text-xs font-semibold text-[#A9792C] tracking-wide">
                  25+ Years Experience • 3,200+ Kundalis Matched
                </div>
                <p className="text-xs text-[#241F1C]/50 pt-1 leading-normal font-normal">
                  Expert guidance rooted firmly in regional Vedic traditions approved by temple councils.
                </p>
              </div>

              <div className="absolute -inset-px rounded-3xl border border-transparent group-hover:border-[#A9792C]/30 transition-colors pointer-events-none duration-500" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};