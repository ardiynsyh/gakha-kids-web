import { motion } from 'framer-motion';
import { HeroBanner } from '../components/HeroBanner';
import { Features } from '../components/Features';
import { TopDeals } from '../components/TopDeals';
import { NewArrivals } from '../components/NewArrivals';
import { Testimonials } from '../components/Testimonials';
import { TribalCulture } from '../components/TribalCulture';
import { SEO } from '../components/SEO';

// ── Manifesto Section ─────────────────────────────────────────────────────────
function Manifesto() {
  const words = [
    'Untuk yang pernah berdiri',
    'di bawah guyuran hujan,',
    'menyanyikan nama',
    'yang kamu cintai.',
  ];

  return (
    <section className="relative py-40 bg-white overflow-hidden">
      {/* Subtle green ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(64,145,108,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Horizontal rule top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#003300]/60 to-transparent" />

      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">

        {/* Vertical line accent */}
        <motion.div
          className="w-px mx-auto bg-gradient-to-b from-transparent via-[#1b5e20] to-transparent mb-16"
          initial={{ height: 0 }}
          whileInView={{ height: 80 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
        />

        {/* Manifesto text — words stagger in */}
        <div className="space-y-2">
          {words.map((line, i) => (
            <motion.p
              key={i}
              className="text-[clamp(1.6rem,4.5vw,3.2rem)] font-black text-[#001a00] leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {i === 2 ? (
                <>
                  {line.split(' ')[0]}{' '}
                  <span className="text-[#2e7d32]">{line.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                line
              )}
            </motion.p>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          className="w-16 h-px bg-[#003300] mx-auto mt-14 mb-6"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />

        <motion.p
          className="text-[#003300]/60 text-[9px] uppercase tracking-[0.5em]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1 }}
        >
          — This is for the Terrace
        </motion.p>

        {/* Bottom vertical line */}
        <motion.div
          className="w-px mx-auto bg-gradient-to-b from-[#1b5e20] via-[#003300]/40 to-transparent mt-16"
          initial={{ height: 0 }}
          whileInView={{ height: 80 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3, ease: [0.77, 0, 0.175, 1] }}
        />
      </div>

      {/* Horizontal rule bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#003300]/60 to-transparent" />
    </section>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <div className="bg-white text-[#001a00] overflow-x-hidden transition-colors duration-300 relative min-h-screen">

      {/* ── Global Film Grain Overlay ──────────────────────────────────── */}
      <svg
        className="pointer-events-none fixed inset-0 z-[100] w-full h-full"
        style={{ position: 'fixed', opacity: 0.04, mixBlendMode: 'overlay' }}
        aria-hidden="true"
      >
        <filter id="pageGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#pageGrain)" />
      </svg>

      <SEO
        title="Beranda | GAKHA"
        description="GAKHA — Brand fashion eksklusif untuk supporter sepak bola Indonesia. Koleksi Terrace Wear terinspirasi kultur tribal daerah."
      />

      {/* ── Sections ──────────────────────────────────────────────────── */}
      <HeroBanner />
      <Manifesto />
      <Features />
      <NewArrivals />
      <TribalCulture />
      <TopDeals />
    </div>
  );
}
