import React, { useState, useRef, } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Sparkles } from 'lucide-react';

// Register GSAP Plugin safely
gsap.registerPlugin(useGSAP);

export interface CultureItem {
  hi: string;
  en: string;
  colors: [string, string];
  desc: string;
}

const cultureData: CultureItem[] = [
  { hi: "धाम", en: "Traditional Himachali feast", colors: ["#f7d070", "#c9924a"], desc: "A slow-cooked community feast prepared by traditional chefs (Botis), serving heritage on a leaf plate." },
  { hi: "नाटी", en: "The heartbeat of celebration", colors: ["#e05a82", "#7A1E3A"], desc: "The synchronized, elegant dance form echoing through the valleys, celebrating unity and life." },
  { hi: "विवाह परंपराएं", en: "Rituals passed down generations", colors: ["#5ea37d", "#305943"], desc: "Sacred matrimonial customs deeply tied to local devtas, rich attire, and timeless hill folklore." },
  { hi: "देव परंपरा", en: "The living faith of Devbhoomi", colors: ["#8cb4db", "#4a6a8a"], desc: "The ancient spiritual governance where deities interact actively with community gatherings." },
];

export const Culture: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs for GSAP luxury micro-interactions
  const containerRef = useRef<HTMLDivElement>(null);
  const leftHeroRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const activeBgRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  // 1. Entrance & Continuous Ambient Light Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

    gsap.set(['.animate-fade', '.animate-stagger'], { opacity: 0 });

    tl.fromTo(leftHeroRef.current, { scale: 1.02, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 })
      .fromTo(rightPanelRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1 }, '-=1.1')
      .to('.animate-fade', { opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.8')
      .fromTo('.animate-stagger', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06 }, '-=0.6');

    // Soft ambient drift loops (Linear style)
    gsap.to('.ambient-glow-1', { x: '+=30', y: '-=40', duration: 18, repeat: -1, yoyo: true, ease: 'none' });
    gsap.to('.ambient-glow-2', { x: '-=40', y: '+=20', duration: 14, repeat: -1, yoyo: true, ease: 'none' });
  }, { scope: containerRef });

  // 2. Premium Mouse Parallax (Left Panel)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!leftHeroRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const moveX = (clientX - innerWidth / 4) * 0.015;
    const moveY = (clientY - innerHeight / 2) * 0.015;

    gsap.to('.parallax-bg', { x: moveX, y: moveY, duration: 0.8, ease: 'power2.out' });
    gsap.to('.parallax-text', { x: moveX * 0.4, y: moveY * 0.4, duration: 0.6, ease: 'power2.out' });
  };

  // 3. Dynamic Structural Background Transition Loop
  useGSAP(() => {
    const activeItem = cultureData[currentIndex];
    gsap.to(activeBgRef.current, {
      background: `linear-gradient(150deg, ${activeItem.colors[0]}, ${activeItem.colors[1]})`,
      duration: 1.4,
      ease: 'power3.inOut',
    });
    
    gsap.fromTo('.culture-text-switch', 
      { opacity: 0, y: 8 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 }
    );
  }, [currentIndex]);

  // 4. Magnetic Button Micro-interaction
  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = primaryBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, { x: x * 0.25, y: y * 0.25, scale: 1.01, duration: 0.3, ease: 'power2.out' });
  };

  const handleButtonMouseLeave = () => {
    gsap.to(primaryBtnRef.current, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-[#FAFAFA] text-[#1A1A1A] font-sans antialiased selection:bg-[#7A1E3A]/10 py-12 lg:py-0">
      
      {/* Background Decorative Premium Lights */}
      <div className="ambient-glow-1 absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#7A1E3A]/05 blur-[130px] pointer-events-none" />
      <div className="ambient-glow-2 absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[#c9924a]/03 blur-[150px] pointer-events-none" />

      <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col lg:flex-row lg:px-6 items-center justify-center gap-8">
        
        {/* LEFT SIDE: Immersive Interactive Narrative Panel */}
        <div 
          ref={leftHeroRef}
          onMouseMove={handleMouseMove}
          className="relative flex h-[480px] w-full flex-col justify-between p-8 sm:p-12 overflow-hidden rounded-[24px] lg:w-1/2 border border-black/[0.04] bg-white shadow-sm"
        >
          {/* Dynamic Parallax Background Gradient Mesh */}
          <div ref={activeBgRef} className="parallax-bg absolute inset-0 opacity-20 scale-105 transition-all" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/50 to-white" />

          {/* Minimalist Header Badge */}
          <div className="animate-fade relative z-10 flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-[#7A1E3A] animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-[#707070] uppercase">हिमाचली संस्कृति</span>
          </div>

          {/* Dynamic Typographic Context */}
          <div className="parallax-text relative z-10 space-y-4">
            <div className="h-32 flex flex-col justify-end">
              <h1 className="culture-text-switch font-hindi text-5xl font-black text-[#1A1A1A] leading-none drop-shadow-sm">
                {cultureData[currentIndex].hi}
              </h1>
              <p className="culture-text-switch mt-3 text-sm text-[#555555] font-light max-w-sm tracking-wide">
                {cultureData[currentIndex].en}
              </p>
            </div>
          </div>

          {/* Institutional Subtle Frame Footer */}
          <div className="animate-fade relative z-10 text-[11px] text-[#707070]/60 tracking-wider uppercase font-medium">
            Rooted in Devbhoomi Heritage
          </div>
        </div>

        {/* RIGHT SIDE: Apple/Linear-Level Glassmorphic Control Panel */}
        <div ref={rightPanelRef} className="flex w-full flex-col justify-center px-4 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md space-y-8 mx-auto lg:mx-0">
            
            <div className="space-y-3">
              <h2 className="animate-stagger text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
                Our Cultural Roots
              </h2>
              <p className="animate-stagger text-sm text-[#666666] leading-relaxed font-light">
                We build modern tech frameworks proudly integrated with traditional values passed down generations.
              </p>
            </div>

            {/* Selection Array Group */}
            <div className="animate-stagger space-y-3">
              {cultureData.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.hi}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-full text-left p-4 rounded-xl transition-all duration-300 border focus:outline-none select-none ${
                      isActive 
                        ? "bg-white border-black/[0.06] shadow-xl shadow-black/[0.02]" 
                        : "bg-transparent border-transparent hover:bg-black/[0.01] hover:border-black/[0.02]"
                    }`}
                  >
                    {/* Active dynamic accent pill track indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#7A1E3A]" />
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className={`font-hindi text-base font-bold transition-colors ${isActive ? "text-[#7A1E3A]" : "text-[#555555]"}`}>
                            {item.hi}
                          </span>
                          <span className="text-[11px] text-[#707070]/70 font-light">— {item.en}</span>
                        </div>
                        {isActive && (
                          <p className="text-xs text-[#666666] leading-relaxed font-light pr-4 mt-1 animate-fade">
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <div className={`transition-transform duration-300 ${isActive ? "text-[#7A1E3A] rotate-0 scale-100" : "text-[#707070]/40 -rotate-45 scale-90"}`}>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Magnetic Functional Callout Anchor */}
            <button
              ref={primaryBtnRef}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              className="animate-stagger relative w-full rounded-xl bg-[#7A1E3A] py-3.5 text-center text-sm font-semibold text-white transition-all shadow-lg shadow-[#7A1E3A]/10 hover:shadow-[#7A1E3A]/20 active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              <span>Explore Cultural Chronicle</span>
              <Sparkles size={15} className="transition-transform group-hover:rotate-12 duration-300" />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};