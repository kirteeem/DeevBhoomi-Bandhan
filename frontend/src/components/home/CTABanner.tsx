import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export const CTABanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const secondaryBtnRef = useRef<HTMLAnchorElement>(null);

  // Entrance and infinite low-frequency ambient float animations
  useGSAP(() => {
    gsap.fromTo(bannerRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }
    );
    
    // Smooth slow-motion mesh rotation effect
    gsap.to('.cta-mesh-bg', {
      scale: 1.15,
      x: '+=15',
      y: '-=15',
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, { scope: bannerRef });

  // Premium Magnetic Field Physics for CTA actions
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>, targetRef: React.RefObject<HTMLAnchorElement | null>) => {
    const btn = targetRef.current;
    if (!btn) return;
    const bounds = btn.getBoundingClientRect();
    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;

    gsap.to(btn, { x: x * 0.25, y: y * 0.25, scale: 1.02, duration: 0.3, ease: 'power2.out' });
  };

  const handleMagneticReset = (targetRef: React.RefObject<HTMLAnchorElement | null>) => {
    gsap.to(targetRef.current, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pb-28">
      <div
        ref={bannerRef}
        className="relative overflow-hidden rounded-[32px] border border-white/[0.04] bg-[#0d0d0d] p-12 text-center shadow-2xl shadow-black/40 sm:p-20"
      >
        
        {/* BACKGROUND ARTISTRY: Luxury dark gradient mesh & texture overlay */}
        <div 
          className="cta-mesh-bg absolute inset-0 opacity-30 scale-105 pointer-events-none transition-transform duration-700" 
          style={{ 
            backgroundImage: `
              radial-gradient(circle at 20% 30%, #7A1E3A 0%, transparent 40%), 
              radial-gradient(circle at 85% 75%, #F4B400 0%, transparent 35%),
              linear-gradient(135deg, #111111 0%, #070707 100%)
            ` 
          }} 
        />
        
        {/* Subtle geometric dot matrix texture for a premium software feel */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        
        {/* Solid cinematic lighting block overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/90 via-transparent to-[#090909]/40 pointer-events-none" />

        {/* COMPONENT FOREGROUND CONTENT */}
        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
          
          {/* Elite Mini Tag Capsule */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#F4B400] backdrop-blur-md">
            <Sparkles size={12} className="text-[#F4B400] animate-pulse" />
            Exclusive Matchmaking
          </div>

          {/* Hindi Typography Header */}
          <h2 className="font-hindi text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight bg-gradient-to-b from-white via-white to-white/80 bg-clip-text">
            अपने परिवार के लिए सही रिश्ता आज ही खोजें
          </h2>
          
          {/* Subtext description with elegant dark tone formatting */}
          <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-[#A0A0A0]">
            हज़ारों संस्कारी परिवार पहले से जुड़े हैं — आप भी जुड़ें, बिल्कुल निःशुल्क।
          </p>

          {/* High-Fidelity Interactive Buttons Clusters */}
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link
              ref={primaryBtnRef}
              to="/signup"
              onMouseMove={(e) => handleMagneticMove(e, primaryBtnRef)}
              onMouseLeave={() => handleMagneticReset(primaryBtnRef)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#F4B400] px-10 py-4 font-sans text-xs font-bold tracking-wider text-black uppercase shadow-xl shadow-[#F4B400]/05 hover:shadow-[#F4B400]/15 transition-all active:scale-[0.99] select-none"
            >
              <span>Create Profile</span>
            </Link>

            <Link
              ref={secondaryBtnRef}
              to="/matches"
              onMouseMove={(e) => handleMagneticMove(e, secondaryBtnRef)}
              onMouseLeave={() => handleMagneticReset(secondaryBtnRef)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-10 py-4 font-sans text-xs font-bold tracking-wider text-white uppercase hover:bg-white/[0.05] hover:border-white/[0.12] backdrop-blur-md transition-all active:scale-[0.99] select-none group"
            >
              <span>Browse Matches</span>
              <ArrowUpRight size={14} className="text-[#A0A0A0] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};