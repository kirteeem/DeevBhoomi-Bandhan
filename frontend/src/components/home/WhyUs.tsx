import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Mountain, Sparkles, Users, ShieldCheck, MoveUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 1. Import your images here
// import imageRoots from "../../assets/roots.jpeg";
// import imagePrecision from "../../assets/precision.jpeg";
// import imageValues from "../../assets/values.jpeg";
// import imageSecurity from "../../assets/security.jpeg";

gsap.registerPlugin(ScrollTrigger);

export const WhyUs = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray(".gsap-reveal-block");
      blocks.forEach((block: any) => {
        // Smooth slide-up for contents
        gsap.fromTo(
          block.querySelector(".reveal-content"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
        // Subtle micro-scale down on the image for a high-end parallax effect
        const img = block.querySelector(".reveal-image");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.1, opacity: 0.8 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.4,
              ease: "power2.out",
              scrollTrigger: {
                trigger: block,
                start: "top 85%"
              }
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const tracks = [
    { 
      icon: Mountain, 
      title: t("why.himachalFocused"), 
      desc: t("why.himachalFocusedDesc"),
      num: "01 / ROOTS",
      caption: "Native Lineage Architecture",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop" // Replace with imageRoots
    },
    { 
      icon: Sparkles, 
      title: t("why.freeKundali"), 
      desc: t("why.freeKundaliDesc"),
      num: "02 / PRECISION",
      caption: "Zero Cost Cosmic Audits",
      image: "https://images.unsplash.com/photo-1507504038482-7621c6784cc2?q=80&w=800&auto=format&fit=crop" // Replace with imagePrecision
    },
    { 
      icon: Users, 
      title: t("why.familyValues"), 
      desc: t("why.familyValuesDesc"),
      num: "03 / VALUES",
      caption: "Ethical Match Integrity",
      image: "https://images.unsplash.com/photo-1609234656388-0ff363383899?q=80&w=800&auto=format&fit=crop" // Replace with imageValues
    },
    { 
      icon: ShieldCheck, 
      title: t("why.privacy"), 
      desc: t("why.privacyDesc"),
      num: "04 / SECURITY",
      caption: "Sovereign Structural Privacy",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop" // Replace with imageSecurity
    }
  ];

  return (
    <section 
      ref={containerRef} 
      className="relative w-full overflow-hidden bg-[#FAF6F0] py-32 lg:py-40 border-b border-[#6B1F2A]/10"
    >
      {/* Background Linear Matrix Layer */}
      <div className="absolute top-0 left-[8%] w-px h-full bg-[#6B1F2A]/5 hidden lg:block" />
      <div className="absolute top-0 right-[8%] w-px h-full bg-[#6B1F2A]/5 hidden lg:block" />

      <div className="mx-auto max-w-7xl px-6 relative">
        
        {/* Layer 1: Left-Aligned Large Asymmetrical Heading Block */}
        <div className="max-w-3xl mb-24 lg:mb-36 pl-0 lg:pl-[8%]">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A9792C]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#6B1F2A]/70">
              {t("why.eyebrow")}
            </span>
          </div>
          
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#6B1F2A] leading-[1.1] tracking-tight">
            Designed for those who value <br />
            <span className="font-sans font-black text-[#241F1C] italic tracking-normal">
              {t("why.title")}
            </span>
          </h2>
        </div>

        {/* Layer 2: Editorial Alternating Layout with Integrated Media Frame */}
        <div ref={elementsRef} className="space-y-32 lg:space-y-48">
          {tracks.map((track, index) => {
            const Icon = track.icon;
            const isEven = index % 2 === 0;

            return (
              <div 
                key={track.title}
                className={`gsap-reveal-block w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center pl-0 lg:pl-[8%] lg:pr-[8%] ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* PART A: Content Block Split */}
                <div className="reveal-content w-full lg:w-[55%] grid grid-cols-1 sm:grid-cols-12 gap-6 items-start border-t border-[#6B1F2A]/20 pt-8 group order-2 lg:order-1">
                  
                  {/* Left Metadata Panel */}
                  <div className="sm:col-span-4 space-y-2">
                    <span className="block font-mono text-xs font-bold text-[#A9792C] tracking-widest">
                      {track.num}
                    </span>
                    <p className="text-[11px] font-mono text-[#241F1C]/40 uppercase tracking-wider">
                      {track.caption}
                    </p>
                  </div>

                  {/* Center Content Title & Layout Narrative */}
                  <div className="sm:col-span-7 space-y-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#6B1F2A] tracking-tight group-hover:text-[#A9792C] transition-colors duration-400">
                      {track.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#241F1C]/70 max-w-xl">
                      {track.desc}
                    </p>
                  </div>

                  {/* Right Integrated Dynamic Icon Token */}
                  <div className="sm:col-span-1 flex lg:justify-end pt-1">
                    <div className="relative w-11 h-11 flex items-center justify-center text-[#6B1F2A] group-hover:text-[#A9792C] transition-colors duration-300">
                      <div className="absolute inset-0 border border-[#6B1F2A]/10 rounded-xl rotate-45 group-hover:rotate-90 group-hover:border-[#A9792C]/40 transition-transform duration-500" />
                      <Icon size={16} strokeWidth={1.25} className="relative z-10" />
                    </div>
                  </div>
                </div>

                {/* PART B: Professional Asymmetric Media Frame */}
                <div className="w-full lg:w-[45%] order-1 lg:order-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#241F1C]/5 border border-[#6B1F2A]/10 p-2">
                    <div className="w-full h-full overflow-hidden rounded-[1.7rem]">
                      <img 
                        src={track.image} 
                        alt={track.title} 
                        className="reveal-image w-full h-full object-cover object-center filter grayscale-[20%] contrast-[1.05] hover:grayscale-0 transition-all duration-700 ease-out"
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Interactive Runway Minimal Link */}
        <div className="mt-24 lg:mt-36 pt-12 border-t border-[#6B1F2A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pl-0 lg:pl-[8%]">
          <p className="text-xs font-mono text-[#241F1C]/50 uppercase tracking-widest">
            // Uncompromising alignment with himachal customs
          </p>
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#6B1F2A] hover:text-[#A9792C] transition-colors cursor-pointer group">
            <span>Explore Matrimony Philosophy</span>
            <MoveUpRight size={14} className="transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

      </div>
    </section>
  );
};