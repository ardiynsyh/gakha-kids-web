import { Link } from 'react-router';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { LogoGakha } from './LogoGakha';

export function NavigationBar() {
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-[200] transition-all duration-500 font-sans`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
    >
      {/* Announcement Bar */}
      <div className="bg-[#1b5e20] text-white py-2.5 px-4 text-center relative z-[210] border-b border-white/10">
        <div className="max-w-[1600px] mx-auto overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 whitespace-nowrap">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              FLASH SALE: DISCOUNT UP TO 50% FOR ALL NEW DROPS
            </span>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="hidden sm:inline">USE CODE: GAKHA2024</span>
          </p>
        </div>
      </div>

      <div className={`transition-all duration-500 bg-white/95 backdrop-blur-md border-b border-[#1b5e20]/10 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between">

        {/* ── LOGO ── */}
        <Link to="/" className="group cursor-pointer">
          <LogoGakha className="h-12 md:h-14 w-auto" color="#013220" />
        </Link>

        {/* ── Center Nav Links ── */}
        <div className="hidden md:flex items-center gap-10">
          <div className="relative group/dropdown py-4">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span
                className="text-[#001a00] group-hover/dropdown:text-[#2e7d32] font-bold text-[10px] tracking-[0.35em] uppercase transition-colors duration-500"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Football Culture
              </span>
              <ChevronDown className="w-3 h-3 text-[#001a00]/40 group-hover/dropdown:text-[#2e7d32] group-hover/dropdown:rotate-180 transition-all duration-500" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all duration-500">
              <div className="bg-white border border-[#1b5e20]/10 shadow-2xl p-6 min-w-[240px] flex flex-col gap-4">
                {[
                  { label: 'New Drop', id: 'new' },
                  { label: 'Penawaran Spesial', id: 'sale' },
                  { label: 'Koleksi Casuals', id: 'casuals' },
                  { label: 'Terrace Wear', id: 'terrace' },
                  { label: 'Aksesoris/Scarf', id: 'accessories' },
                ].map((item) => (
                  <Link
                    key={item.id}
                    to={`/shop/${item.id}`}
                    className="text-[#003300]/60 hover:text-[#2e7d32] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between group/link"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span>{item.label}</span>
                    <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {[
            { label: 'Collections', to: '/shop/all' },
            { label: 'The Story', to: '/page/about' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[#001a00] hover:text-[#2e7d32] font-bold text-[10px] tracking-[0.35em] uppercase transition-colors duration-500"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative group/regional py-4">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span
                className="text-[#001a00] group-hover/regional:text-[#2e7d32] font-bold text-[10px] tracking-[0.35em] uppercase transition-colors duration-500"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Regional Series
              </span>
              <ChevronDown className="w-3 h-3 text-[#001a00]/40 group-hover/regional:text-[#2e7d32] group-hover/regional:rotate-180 transition-all duration-500" />
            </div>

            {/* Regional Dropdown Menu */}
            <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/regional:opacity-100 group-hover/regional:translate-y-0 group-hover/regional:pointer-events-auto transition-all duration-500">
              <div className="bg-white border border-[#1b5e20]/10 shadow-2xl p-6 min-w-[340px] grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'JAKARTA', id: 'jakarta' },
                  { label: 'BANDUNG', id: 'bandung' },
                  { label: 'SURABAYA', id: 'surabaya' },
                  { label: 'MALANG', id: 'malang' },
                  { label: 'BALI', id: 'bali' },
                  { label: 'Sleman', id: 'sleman' },
                  { label: 'Solo', id: 'solo' },
                  { label: 'Semarang', id: 'semarang' },
                  { label: 'Medan', id: 'medan' },
                  { label: 'Jayapura', id: 'jayapura' },
                  { label: 'SAMARINDA', id: 'samarinda' },
                ].map((city) => (
                  <Link
                    key={city.id}
                    to={`/shop/${city.id}`}
                    className="text-[#003300]/60 hover:text-[#2e7d32] text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group/link"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span>{city.label}</span>
                    <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right CTA & Cart ── */}
        <div className="flex items-center gap-6">
          {/* Cart Icon with Badge */}
          <Link
            to="/checkout"
            className="relative p-2 text-[#001a00] hover:text-[#2e7d32] transition-all duration-300"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cart.length}
                className="absolute -top-1 -right-1 bg-[#2e7d32] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
              >
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </motion.span>
            )}
          </Link>

          <motion.div whileHover="hovered">
            <Link
              to="/shop/all"
              className="relative overflow-hidden inline-flex items-center gap-2.5 bg-[#003300] border border-[#1b5e20]/50 text-white px-7 py-3.5 text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <motion.div
                className="absolute inset-0 bg-[#2e7d32]"
                initial={{ scaleX: 0 }}
                style={{ originX: '0%' }}
                variants={{
                  hovered: { scaleX: 1, transition: { duration: 0.65, ease: [0.77, 0, 0.175, 1] } },
                }}
              />
              <ShoppingBag className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Shop Now</span>
            </Link>
          </motion.div>
        </div>

      </div>
      </div>
    </motion.header>
  );
}
