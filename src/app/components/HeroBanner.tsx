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
  const rainDrops = useRainDrops(80);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // ── Scroll-driven transforms ──────────────────────────────────────────────
  const videoY       = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity  = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const textY        = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const scrollFadeOut= useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  // ── Scroll-driven glitch (intensifies as user scrolls) ────────────────────
  const glitchX      = useTransform(scrollYProgress, [0.04, 0.08, 0.13, 0.18], [0, -12, 16, 0]);
  const glitchXNeg   = useTransform(glitchX, (v) => -v * 0.65);
  const glitchScale  = useTransform(scrollYProgress, [0.04, 0.14], [1, 1.025]);

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
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(46, 125, 50, 0.2) 0%, transparent 80%)'
          }} 
        />
      </motion.div>

      {/* ── Rain drops removed as per solid theme request ── */}

      {/* ── Grain Film Overlay ────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full z-[6] pointer-events-none opacity-[0.07] mix-blend-overlay"
        style={{ position: 'absolute' }}
      >
        <filter id="heroGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroGrain)" />
      </svg>

      {/* ── Hero Content ─────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-[20] flex flex-col items-center justify-center px-4"
        style={{ opacity: heroOpacity, y: textY }}
      >
        {/* ── GAKHA Logo (Synced with Nav) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-8"
        >
          <LogoGakha className="h-24 md:h-28 w-auto" color="white" showText={false} />
        </motion.div>

        {/* ── GAKHA Title with Scroll-Driven Glitch ─────────────────────── */}
        <div className="relative text-center">
          {/* ── Chromatic layers removed for maximum sharpness ── */}
          {/* Forest green bloom glow */}
          <h1
            className="absolute inset-0 text-[#2e7d32] select-none pointer-events-none"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(4rem, 15vw, 14rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '0.06em',
              filter: 'blur(35px)',
              opacity: 0.5,
            }}
          >
            GAKHA
          </h1>

          {/* ── Main GAKHA text — Crisp White ────────────────── */}
          <motion.h1
            className="relative text-white"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(4rem, 15vw, 14rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '0.06em',
              textShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          >
            GAKHA
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          className="text-white uppercase tracking-[0.55em] text-[10px] md:text-[12px] mt-7 text-center font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        >
          Football Culture&nbsp;&nbsp;·&nbsp;&nbsp;Supporter Identity&nbsp;&nbsp;·&nbsp;&nbsp;Terrace Wear
        </motion.p>

        {/* ── CTA Buttons ─────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-6 mt-16"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2.1 }}
        >
          {/* Primary — "Heavy hover" slow expansion */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Link
              to="/shop/all"
              id="hero-cta-shop"
              className="relative overflow-hidden inline-flex items-center justify-center bg-[#2e7d32] text-white px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] hover:shadow-[0_40px_80px_-15px_rgba(46,125,50,0.5)] transition-all rounded-2xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* Ghost button */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/#regional-series"
              id="hero-cta-regions"
              className="inline-flex items-center gap-4 text-white px-8 py-5 text-[10px] font-black tracking-[0.4em] uppercase border-2 border-white/20 hover:border-white/50 hover:bg-white/5 transition-all rounded-2xl backdrop-blur-sm shadow-xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span>Regional Series</span>
              <span className="text-white/40 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

    </div>
  );
}
