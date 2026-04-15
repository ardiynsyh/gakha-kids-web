import { Link } from 'react-router';
import { Instagram, Twitter, Facebook, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const TRIBE_LINKS = [
  { label: 'Jakarta', href: '/shop/jakarta', color: '#CC0000' },
  { label: 'Bandung', href: '/shop/bandung', color: '#003087' },
  { label: 'Malang', href: '/shop/malang', color: '#1E4DB7' },
  { label: 'Surabaya', href: '/shop/surabaya', color: '#00AA00' },
  { label: 'Bali', href: '/shop/bali', color: '#FF4500' },
  { label: 'Solo', href: '/shop/solo', color: '#E31837' },
];

export function Footer() {
  const { config } = useStore();
  const year = new Date().getFullYear();

  const socialLinks = [
    { name: 'Instagram', icon: <Instagram className="w-4 h-4" />, href: config?.socialMedia?.instagram || '#' },
    { name: 'TikTok', icon: <TikTokIcon />, href: config?.socialMedia?.tiktok || '#' },
    { name: 'WhatsApp', icon: <Phone className="w-4 h-4" />, href: `https://wa.me/${config?.socialMedia?.resellerWhatsApp}` || '#' },
    { name: 'Twitter/X', icon: <Twitter className="w-4 h-4" />, href: config?.socialMedia?.twitter || '#' },
    { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, href: config?.socialMedia?.facebook || '#' },
  ];

  return (
    <footer className="relative overflow-hidden bg-white border-t border-[#e2e8f0]">
      
      {/* Top green divider gradient */}
      <div className="w-full h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, #1b5e20, #2e7d32, #1b5e20, transparent)' }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(45, 106, 79, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45, 106, 79, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 pt-12 pb-6">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block group cursor-pointer">
              <div 
                className="text-[2.5rem] font-black tracking-widest leading-none text-[#001a00] uppercase"
                style={{ 
                  fontFamily: "'Bebas Neue', sans-serif",
                }}
              >
                GAKHA
              </div>
              <div 
                className="text-[8px] font-black tracking-[0.45em] text-[#2e7d32] uppercase mt-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Football Supporter Fashion
              </div>
            </Link>

            <p 
              className="text-[#003300]/70 text-[13px] leading-loose pr-4 max-w-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Fashion jalanan untuk jiwa supporter sejati. Lahir dari tribun, dipakai di jalanan — Merawat kultur Nusantara.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center text-[#003300]/60 border border-[#1b5e20]/20 hover:border-[#2e7d32] hover:text-white hover:bg-[#2e7d32] transition-all duration-500 rounded-sm"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Tribe Collections */}
          <div>
            <h4 
              className="font-black text-[#001a00] mb-6 uppercase tracking-[0.25em] text-[11px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-[#2e7d32] mr-2">—</span> Koleksi Regional
            </h4>
            <ul className="space-y-4">
              {TRIBE_LINKS.map((tribe) => (
                <li key={tribe.href}>
                  <Link 
                    to={tribe.href} 
                    className="group flex items-center gap-3 text-[#003300]/70 hover:text-[#2e7d32] text-[13px] transition-colors duration-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:scale-150 transition-transform duration-500"
                      style={{ background: tribe.color, boxShadow: `0 0 10px ${tribe.color}` }}
                    />
                    {tribe.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 
              className="font-black text-[#001a00] mb-6 uppercase tracking-[0.25em] text-[11px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-[#2e7d32] mr-2">—</span> Kategori
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'New Drop', href: '/shop/new' },
                { label: 'Penawaran Spesial', href: '/shop/sale' },
                { label: 'Koleksi Casuals', href: '/shop/casuals' },
                { label: 'Terrace Wear', href: '/shop/terrace' },
                { label: 'Aksesoris/Scarf', href: '/shop/accessories' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-[#003300]/70 hover:text-[#2e7d32] hover:translate-x-1 block text-[13px] transition-all duration-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Help */}
          <div>
            <h4 
              className="font-black text-[#001a00] mb-6 uppercase tracking-[0.25em] text-[11px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-[#2e7d32] mr-2">—</span> Bantuan & Info
            </h4>
            
            <div className="space-y-4 mb-10">
              {[
                { label: 'Info Pengiriman', href: '/page/shipping' },
                { label: 'Kebijakan Pengembalian', href: '/page/returns' },
                { label: 'Program Reseller', href: '/page/reseller' },
                { label: 'Tentang GAKHA', href: '/page/about' },
                { label: 'FAQ', href: '/page/faq' },
              ].map((link) => (
                <div key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-[#003300]/70 hover:text-[#2e7d32] hover:translate-x-1 block text-[13px] transition-all duration-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a 
              href={`https://wa.me/${config?.socialMedia?.resellerWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden flex items-center gap-4 p-4 border border-[#e2e8f0] bg-[#f8faf9] hover:border-[#2e7d32] transition-all duration-500 rounded-sm"
            >
              <div className="absolute inset-0 bg-[#2e7d32] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-in-out" />
              <div className="w-10 h-10 bg-white border border-[#1b5e20]/20 flex items-center justify-center text-[#2e7d32] group-hover:text-white rounded-full z-10 transition-colors duration-500">
                <Phone className="w-4 h-4" />
              </div>
              <div className="z-10">
                <p 
                  className="text-[8px] font-black tracking-[0.3em] text-[#2e7d32] group-hover:text-white/90 uppercase mb-1 transition-colors duration-500"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Line Utama
                </p>
                <p 
                  className="text-sm font-bold text-[#001a00] group-hover:text-white tracking-wide transition-colors duration-500"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  WhatsApp CS →
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div 
            className="text-[#003300]/50 text-[11px] tracking-wide flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span>© {year} GAKHA</span>
            <span className="w-1 h-1 rounded-full bg-[#2e7d32]" />
            <span>Built for the Terrace</span>
          </motion.div>
          <div className="flex items-center gap-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Link to="/page/privacy" className="text-[9px] uppercase font-bold text-[#003300]/50 hover:text-[#2e7d32] transition-colors tracking-[0.2em]">Privacy Policy</Link>
            <Link to="/page/terms" className="text-[9px] uppercase font-bold text-[#003300]/50 hover:text-[#2e7d32] transition-colors tracking-[0.2em]">Terms of Service</Link>
            <Link to="/page/cookies" className="text-[9px] uppercase font-bold text-[#003300]/50 hover:text-[#2e7d32] transition-colors tracking-[0.2em]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
