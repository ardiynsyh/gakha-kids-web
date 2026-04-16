import { Link } from 'react-router';
import { motion } from 'framer-motion';

const TRIBES = [
  {
    city: 'JAKARTA',
    tribe: 'THE JAK',
    tagline: 'Merah Betawi, Jiwa Jakarta',
    color: '#CC0000',
    colorSecondary: '#FF6B6B',
    route: '/shop/jakarta',
    image: '/cities/jakarta.png',
    symbol: '🔴',
    founded: 'est. 1928',
    desc: 'Koleksi terinspirasi batik Betawi dan kultur supporter Jakarta. Identitas merah membara.'
  },
  {
    city: 'BANDUNG',
    tribe: 'VIKING',
    tagline: 'Biru Viking Tatar Sunda',
    color: '#003087',
    colorSecondary: '#4A90D9',
    route: '/shop/bandung',
    image: '/cities/bandung.png',
    symbol: '🔵',
    founded: 'est. 1933',
    desc: 'Warisan Sunda dalam balutan biru. Fashion jalanan khas Kota Kembang.'
  },
  {
    city: 'MALANG',
    tribe: 'AREMA',
    tagline: 'Singo Edan Malang Raya',
    color: '#1A5C99',
    colorSecondary: '#6BB3E0',
    route: '/shop/malang',
    image: '/cities/malang.png',
    symbol: '🦁',
    founded: 'est. 1987',
    desc: 'Tribal Jawa Timur dengan spirit Arek Malang. Bold, lakon, dan tak tertaklukkan.'
  },
  {
    city: 'SURABAYA',
    tribe: 'BONEK',
    tagline: 'Modal Nekat Arek Surabaya',
    color: '#00AA00',
    colorSecondary: '#66CC66',
    route: '/shop/surabaya',
    image: '/cities/surabaya.png',
    symbol: '💚',
    founded: 'est. 1927',
    desc: 'Spirit Arek Surabaya — modal nekat, harga diri tiada tanding. Merah-Hijau yang tak pernah padam.'
  },
  {
    city: 'MAKASSAR',
    tribe: 'JUKU EJA',
    tagline: 'Juku Eja Sulawesi Selatan',
    color: '#E31837',
    colorSecondary: '#FF5060',
    route: '/shop/makassar',
    image: '/cities/makassar.png',
    symbol: '🦅',
    founded: 'est. 1915',
    desc: 'Juku Eja. Merah seperti darah Sulawesi. Terinspirasi motif Bugis dan Makassar.'
  },
  {
    city: 'BALI',
    tribe: 'SERDADU TRIDATU',
    tagline: 'Pulau Surga Sepak Bola',
    color: '#FF4500',
    colorSecondary: '#FF8C00',
    route: '/shop/bali',
    image: '/cities/bali.png',
    symbol: '🌺',
    founded: 'est. 2015',
    desc: 'Ukiran Barong, api Bali, dan semangat supporter pulau dewata dalam satu koleksi.'
  },
];

export function TribalCulture() {
  return (
    <section className="relative py-32 bg-white overflow-hidden">
      
      {/* Background patterns */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ background: 'linear-gradient(90deg, transparent, #FF3D00, #FFD600, #FF3D00, transparent)' }}
      />

      {/* Atmospheric background */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,61,0,0.15) 0%, transparent 70%)' }}
      />

      <div className="max-w-[1800px] mx-auto px-[clamp(1rem,5vw,4rem)] relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 mb-6"
          >
            <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#2e7d32]" />
            <span className="text-[10px] font-black tracking-[0.4em] text-[#2e7d32] uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Koleksi Tribal Nusantara
            </span>
            <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#2e7d32]" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(2rem,6vw,5rem)] font-black text-[#001a00] leading-none tracking-tight mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            BELA <span className="text-[#2e7d32]">KOTAMU</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#001a00] text-sm max-w-xl mx-auto font-medium"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            6 koleksi eksklusif terinspirasi kultur dan identitas supporter sepak bola daerah-daerah besar Indonesia.
          </motion.p>
        </div>

        {/* Tribe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRIBES.map((tribe, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link 
                to={tribe.route}
                className="group relative block overflow-hidden border border-[#e2e8f0] rounded-sm transition-transform duration-[800ms] hover:-translate-y-1"
                style={{ background: '#ffffff' }}
              >
                {/* Image with overlay */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={tribe.image}
                    alt={`${tribe.tribe} — ${tribe.city}`}
                    className="w-full h-full object-cover object-center filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  />
                  {/* White gradient overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-[800ms]"
                    style={{ 
                      background: `linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 40%, transparent 100%)`
                    }}
                  />
                  {/* Color tint on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-[800ms]"
                    style={{ background: tribe.color }}
                  />

                  {/* Top accent line */}
                  <div 
                    className="absolute top-0 left-0 w-full h-[3px]"
                    style={{ background: tribe.color }}
                  />

                  {/* Content overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Founded badge */}
                    <span 
                      className="text-[8px] font-black tracking-[0.35em] uppercase mb-3 opacity-60"
                      style={{ color: tribe.color }}
                    >
                      {tribe.founded}
                    </span>

                    {/* City name */}
                    <h3 
                      className="text-[clamp(1.8rem,4vw,2.5rem)] font-black text-[#001a00] leading-none mb-1 tracking-wide relative z-10"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {tribe.city}
                    </h3>

                    {/* Tagline */}
                    <p className="text-[#003300]/70 font-medium text-xs mb-4 italic leading-relaxed relative z-10">
                      "{tribe.tagline}"
                    </p>

                    {/* CTA */}
                    <div 
                      className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-white px-4 py-2 self-start opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400"
                      style={{ 
                        background: tribe.color,
                        clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)'
                      }}
                    >
                      Lihat Koleksi →
                    </div>
                  </div>
                </div>

                {/* Bottom info panel */}
                <div className="p-4 border-t" style={{ borderColor: `${tribe.color}20` }}>
                  <p className="text-[#003300]/60 font-medium text-[11px] leading-relaxed line-clamp-2">
                    {tribe.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link 
            to="/shop/all"
            className="inline-flex items-center gap-4 font-black uppercase tracking-[0.2em] text-sm text-[#001a00] px-12 py-5 transition-all duration-300 hover:gap-6 bg-white"
            style={{
              border: '1px solid rgba(64,145,108,0.4)',
              clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            }}
          >
            <span>Lihat Semua Koleksi</span>
            <span className="text-[#2e7d32]">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 w-full h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #1b5e20, #2e7d32, #1b5e20, transparent)' }}
      />
    </section>
  );
}
