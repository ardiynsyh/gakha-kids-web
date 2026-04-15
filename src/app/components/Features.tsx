import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';

// ── City SVG Iconography ───────────────────────────────────────────────────────

function MonasIcon() {
  return (
    <svg viewBox="0 0 60 130" className="w-full h-full fill-current" aria-label="Monas Jakarta">
      {/* Flame top */}
      <ellipse cx="30" cy="8" rx="5" ry="8" className="fill-[#FFD700]" opacity={0.9} />
      {/* Obelisk spire */}
      <polygon points="28,14 32,14 35,58 25,58" />
      {/* Main shaft */}
      <rect x="22" y="58" width="16" height="36" />
      {/* Pedestal steps */}
      <rect x="17" y="94" width="26" height="8" />
      <rect x="11" y="102" width="38" height="8" />
      <rect x="5" y="110" width="50" height="10" />
    </svg>
  );
}

function GedungSateIcon() {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full fill-current" aria-label="Gedung Sate Bandung">
      {/* Central spike – the "satay" */}
      <rect x="48" y="4" width="4" height="28" />
      <circle cx="50" cy="4" r="4" />
      <circle cx="50" cy="13" r="3" className="fill-[#FFD700]" />
      <circle cx="50" cy="22" r="2.5" className="fill-[#FFD700]" />
      {/* Roof */}
      <polygon points="50,32 76,52 24,52" />
      {/* Wing roofs */}
      <polygon points="24,52 10,66 38,66" opacity={0.7} />
      <polygon points="76,52 90,66 62,66" opacity={0.7} />
      {/* Building */}
      <rect x="20" y="52" width="60" height="60" />
      {/* Windows */}
      <rect x="28" y="62" width="10" height="14" rx="2" fill="rgba(5,10,7,0.7)" />
      <rect x="45" y="62" width="10" height="14" rx="2" fill="rgba(5,10,7,0.7)" />
      <rect x="62" y="62" width="10" height="14" rx="2" fill="rgba(5,10,7,0.7)" />
      {/* Gate arch */}
      <rect x="42" y="86" width="16" height="26" rx="8" fill="rgba(5,10,7,0.7)" />
    </svg>
  );
}

function TuguPahlawanIcon() {
  return (
    <svg viewBox="0 0 60 140" className="w-full h-full fill-current" aria-label="Tugu Pahlawan Surabaya">
      {/* Pointed bamboo spear top */}
      <polygon points="30,4 34,22 26,22" />
      {/* Tapered column */}
      <polygon points="26,22 34,22 38,110 22,110" />
      {/* Base platform steps */}
      <rect x="18" y="110" width="24" height="8" />
      <rect x="12" y="118" width="36" height="8" />
      <rect x="6" y="126" width="48" height="8" />
    </svg>
  );
}

function BorobudurIcon() {
  return (
    <svg viewBox="0 0 180 130" className="w-full h-full fill-current" aria-label="Borobudur Yogyakarta">
      {/* Top stupa bell */}
      <ellipse cx="90" cy="28" rx="20" ry="26" opacity={0.95} />
      {/* Lattice ring */}
      <rect x="78" y="48" width="24" height="6" />
      {/* Tier 1 */}
      <rect x="68" y="54" width="44" height="12" />
      {/* Tier 2 */}
      <rect x="52" y="66" width="76" height="12" />
      {/* Tier 3 */}
      <rect x="36" y="78" width="108" height="13" />
      {/* Tier 4 base */}
      <rect x="20" y="91" width="140" height="14" />
      {/* Ground platform */}
      <rect x="4" y="105" width="172" height="16" />
    </svg>
  );
}

function FortIcon() {
  return (
    <svg viewBox="0 0 130 130" className="w-full h-full fill-current" aria-label="Fort Rotterdam Makassar">
      {/* Left tower */}
      <rect x="4" y="35" width="24" height="76" />
      <rect x="2" y="26" width="28" height="12" />
      {/* Battlements L */}
      {[3, 11, 19].map((x) => <rect key={x} x={x} y="18" width="6" height="9" />)}
      {/* Right tower */}
      <rect x="102" y="35" width="24" height="76" />
      <rect x="100" y="26" width="28" height="12" />
      {/* Battlements R */}
      {[101, 109, 117].map((x) => <rect key={x} x={x} y="18" width="6" height="9" />)}
      {/* Main wall */}
      <rect x="28" y="50" width="74" height="61" />
      <rect x="28" y="42" width="74" height="11" />
      {/* Gate arch */}
      <rect x="55" y="72" width="20" height="39" rx="10" fill="rgba(5,10,7,0.75)" />
      {/* Flagpole */}
      <rect x="64" y="4" width="2" height="40" />
      <polygon points="66,4 90,14 66,24" />
    </svg>
  );
}

function MalangIcon() {
  return (
    <svg viewBox="0 0 180 120" className="w-full h-full fill-current" aria-label="Mountain Malang">
      {/* Background mountains */}
      <polygon points="130,40 180,110 80,110" opacity={0.5} />
      <polygon points="50,40 0,110 100,110" opacity={0.5} />
      {/* Main volcano */}
      <polygon points="90,8 135,110 45,110" />
      {/* Snow / crater cap */}
      <polygon points="90,8 104,38 76,38" fill="white" opacity={0.18} />
      {/* Crater */}
      <ellipse cx="90" cy="42" rx="9" ry="5" fill="rgba(5,10,7,0.6)" />
    </svg>
  );
}

// ── Regional data ─────────────────────────────────────────────────────────────
const REGIONS = [
  {
    id: 'jakarta',
    name: 'Jakarta',
    tagline: 'Ibu Kota, Jiwa Tak Kenal Lelah',
    products: 24,
    bg: '/cities/jakarta.png',
    overlayColor: 'from-[#ffffff]',
    accentColor: '#2e7d32',
    Icon: MonasIcon,
  },
  {
    id: 'bandung',
    name: 'Bandung',
    tagline: 'Kota Kembang, Kultur Tanpa Henti',
    products: 18,
    bg: '/cities/bandung.png',
    overlayColor: 'from-[#ffffff]',
    accentColor: '#4caf50',
    Icon: GedungSateIcon,
  },
  {
    id: 'surabaya',
    name: 'Surabaya',
    tagline: 'Modal Nekat Arek Suroboyo',
    products: 20,
    bg: '/cities/surabaya.png',
    overlayColor: 'from-[#ffffff]',
    accentColor: '#74c69d',
    Icon: TuguPahlawanIcon,
  },
  {
    id: 'yogyakarta',
    name: 'Yogyakarta',
    tagline: 'Kraton, Kultur, Karya Agung',
    products: 14,
    bg: '/cities/yogyakarta.png',
    overlayColor: 'from-[#ffffff]',
    accentColor: '#95d5b2',
    Icon: BorobudurIcon,
  },
  {
    id: 'makassar',
    name: 'Makassar',
    tagline: 'Juku Eja, Darah Sulawesi',
    products: 16,
    bg: '/cities/makassar.png',
    overlayColor: 'from-[#ffffff]',
    accentColor: '#b7e4c7',
    Icon: FortIcon,
  },
  {
    id: 'malang',
    name: 'Malang',
    tagline: 'Singo Edan Malang Raya',
    products: 12,
    bg: '/cities/malang.png',
    overlayColor: 'from-[#ffffff]',
    accentColor: '#e8f5e9',
    Icon: MalangIcon,
  },
];

export function Features() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      className="py-28 bg-[#f3f7f3] w-full border-t border-white relative overflow-hidden"
      id="regional-series"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full bg-[#e8f5e9] blur-[180px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">

        {/* ── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col mb-16"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <span
            className="text-[#2e7d32] text-[10px] font-black tracking-[0.5em] uppercase mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The Core Collection
          </span>
          <h2
            className="text-[clamp(3rem,8vw,6rem)] font-black text-[#001a00] leading-none tracking-tight drop-shadow-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            REGIONAL<br />SERIES
          </h2>
          <p
            className="max-w-lg text-[#001a00] text-sm mt-5 leading-relaxed font-medium"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Kekuatan tribun dari setiap sudut daerah. Diwarna ulang dengan tone cerah
            untuk menyongsong identitas street culture Indonesia.
          </p>
        </motion.div>

        {/* ── Horizontal Scroll Region Cards ────────────────────────────── */}
        <motion.div
          className="flex gap-5 overflow-x-auto pb-10 snap-x snap-mandatory scrollbar-hide py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          {REGIONS.map((region, idx) => {
            const isActive = activeId === region.id;
            return (
              <motion.div
                key={region.id}
                id={`region-${region.id}`}
                className="relative min-w-[280px] sm:min-w-[320px] md:min-w-[380px] h-[520px] rounded-none overflow-hidden snap-center cursor-pointer group shrink-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setActiveId(isActive ? null : region.id)}
              >
                {/* City background photo */}
                <div className="absolute inset-0">
                  <img
                    src={region.bg}
                    alt={region.name}
                    className={`w-full h-full object-cover transition-all duration-[900ms] ease-out ${
                      isActive
                        ? 'filter-none scale-105'
                        : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-75 group-hover:scale-105'
                    }`}
                  />
                </div>

                {/* Light mode gradient overlay: clear on top, solid white on bottom */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${region.overlayColor} via-white/80 to-transparent transition-opacity duration-[1200ms] ease-[0.23,1,0.32,1] ${
                    isActive ? 'opacity-90' : 'opacity-[0.85] group-hover:opacity-75'
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${region.overlayColor} via-transparent to-transparent opacity-100 z-10 pointer-events-none`}
                />

                {/* ── City SVG Icon — upper area ────────────────────────── */}
                <div className="absolute top-8 right-8 z-20 w-14 h-14 opacity-20 group-hover:opacity-50 transition-opacity duration-700"
                  style={{ color: region.accentColor }}
                >
                  <region.Icon />
                </div>

                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 h-[2px] z-20"
                  style={{ background: region.accentColor }}
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + idx * 0.08, ease: [0.77, 0, 0.175, 1] }}
                />

                {/* ── Card Content ─────────────────────────────────────── */}
                <div className="absolute inset-0 z-30 flex flex-col justify-end p-8">
                  <div className="flex items-center gap-2 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-3 h-3 text-[#001a00]" />
                    <span
                      className="text-[#001a00] text-[8px] font-black tracking-[0.35em] uppercase"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      EDISI KOTA
                    </span>
                  </div>

                  <h3
                    className="text-[2.8rem] md:text-5xl font-black text-[#001a00] uppercase tracking-wider leading-none mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {region.name}
                  </h3>

                  {/* Tagline — visible on hover / active */}
                  <motion.p
                    className="text-[#003300]/80 font-medium text-xs leading-relaxed mb-5 max-w-[220px]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={isActive ? { opacity: 1, y: 0 } : {}}
                    whileInView={{}}
                  >
                    {isActive ? region.tagline : ''}
                  </motion.p>

                  {/* Slow-expansion bar indicator */}
                  <div className="flex items-center gap-3">
                    <div
                      className="h-[2px] overflow-hidden rounded-full transition-all duration-[900ms] ease-out"
                      style={{ width: isActive ? '80px' : '24px', background: region.accentColor, opacity: 0.7 }}
                    >
                      <div
                        className="w-full h-full scale-x-100 origin-left transition-transform duration-[900ms] ease-out"
                        style={{ background: region.accentColor }}
                      />
                    </div>
                    <span
                      className="text-[#003300]/60 text-[9px] font-bold tracking-widest uppercase group-hover:text-[#001a00]/80 transition-colors duration-500"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {region.products} styles
                    </span>
                  </div>

                  {/* CTA — visible on active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.4 }}
                        className="mt-5"
                      >
                          <Link
                          to={`/shop/${region.id}`}
                          className="inline-flex items-center gap-2 text-[#001a00] text-[9px] font-black tracking-[0.3em] uppercase px-5 py-2.5 border border-[#1b5e20]/30 hover:border-[#1b5e20] hover:bg-[#e8f5e9] transition-all duration-[600ms] relative z-20"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explore {region.name} →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Footer note ────────────────────────────────────────────────── */}
        <motion.p
          className="text-white/15 text-[10px] uppercase tracking-[0.4em] mt-4 text-center"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Geser untuk memilih distrik — Klik untuk explore
        </motion.p>

      </div>
    </section>
  );
}
