import { useRef, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogoGakha } from './LogoGakha';

// ── Deterministic rain drops (stable across renders, no Math.random) ──────────
function useRainDrops(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${((i * 100) / count).toFixed(2)}%`,
      height: `${30 + (i * 37) % 90}px`,
      duration: `${(0.45 + (i * 0.068) % 1.25).toFixed(2)}s`,
      delay: `${(i * 0.053) % 4}s`,
      opacity: (0.06 + (i * 0.004) % 0.22).toFixed(3),
      width: i % 4 === 0 ? '1.5px' : '1px',
    })),
  [count]);
}

export function HeroBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // ── Scroll-driven transforms ──────────────────────────────────────────────
  const videoY       = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity  = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const textY        = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);

  // ── Scroll-driven glitch (intensifies as user scrolls) ────────────────────
  const glitchX      = useTransform(scrollYProgress, [0.04, 0.08, 0.13, 0.18], [0, -12, 16, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[65vh] overflow-hidden"
      style={{ marginBottom: 0 }}
      id="hero"
    >
      {/* ── Solid Forest Green Background ─────────────────────────────────────── */}
      <motion.div className="absolute inset-0 z-0 bg-[#003300] shadow-inner" style={{ y: videoY }}>
        {/* Subtle radial shine for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(46,125,50,0.3)_0%,transparent_100%)]" />
      </motion.div>

      {/* ── Content Container (Logo + Name) ─────────────────────────────────── */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full px-6"
        style={{ opacity: heroOpacity, y: textY }}
      >
        {/* ── GAKHA Logo (Synced with Nav) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-12 relative z-10"
        >
          <LogoGakha className="h-20 md:h-24 w-20 md:w-24" color="white" showText={false} />
        </motion.div>

        {/* ── GAKHA Title with Scroll-Driven Glitch ─────────────────────── */}
        <div className="relative text-center">
          {/* ── Chromatic layers removed for maximum sharpness ── */}
          {/* Forest green bloom glow */}
          <div className="absolute inset-0 blur-2xl bg-green-500/10 scale-150 pointer-events-none" />

          {/* Core Headline */}
          <motion.h1
            style={{ x: glitchX }}
            className="text-[clamp(4rem,15vw,12rem)] font-black text-white leading-[0.8] tracking-[-0.04em] uppercase relative select-none"
          >
            GAKHA
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-6 flex flex-wrap justify-center gap-4 text-white/50 text-[clamp(8px,1.5vw,12px)] font-black uppercase tracking-[0.4em]"
          >
            <span>Football Culture</span>
            <span className="opacity-20">•</span>
            <span>Supporter Identity</span>
            <span className="opacity-20">•</span>
            <span>Terrace Wear</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            <Link
              to="/shop/all"
              className="bg-white text-[#003300] px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#2e7d32] hover:text-white transition-all duration-300 shadow-xl"
            >
              Explore Collection
            </Link>
            <Link
              to="#regional"
              className="border border-white/30 text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center gap-3"
            >
              Regional Series <span className="text-white/40">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Grainy Cinematic Texture Overlay ────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.07] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* ── Gradient Fade-Out (Matches Regional Series background) ────────────────── */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#003300] to-transparent z-10" />
    </div>
  );
}
