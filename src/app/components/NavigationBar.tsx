import { Link } from 'react-router';
import { ChevronDown, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { LogoGakha } from './LogoGakha';

export function NavigationBar() {
  const { cart } = useCart();
  const { config } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Collections', to: '/shop/all' },
    { label: 'The Story', to: '/page/about' },
  ];

  const footballLinks = [
    { label: 'New Drop', id: 'new' },
    { label: 'Penawaran Spesial', id: 'sale' },
    { label: 'Koleksi Casuals', id: 'casuals' },
    { label: 'Terrace Wear', id: 'terrace' },
    { label: 'Aksesoris/Scarf', id: 'accessories' },
  ];

  const regionalCities = [
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
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[200] transition-all duration-500 font-sans opacity-100 translate-y-0`}
    >
      {/* Announcement Bar */}
      <div className="bg-[#1b5e20] text-white py-2.5 px-4 text-center relative z-[210] border-b border-white/10">
        <div className="max-w-[1600px] mx-auto overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 whitespace-nowrap">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              {config.announcement?.text || 'FLASH SALE: DISCOUNT UP TO 50% FOR ALL NEW DROPS | USE CODE: GAKHA2024'}
            </span>
          </p>
        </div>
      </div>

      <div className={`transition-all duration-500 bg-white/95 backdrop-blur-md border-b border-[#1b5e20]/10 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* ── Left: Hamburger (Mobile Only) ── */}
          <button 
            className="md:hidden p-2 text-[#001a00] hover:text-[#2e7d32] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* ── Center/Left: LOGO ── */}
          <Link to="/" className="group cursor-pointer">
            <LogoGakha className="h-12 md:h-16 w-12 md:w-16" color="#013220" />
          </Link>

          {/* ── Center: Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-10">
            <div className="relative group/dropdown">
              <Link 
                to="/shop/all"
                className="flex items-center gap-1.5 py-4 cursor-pointer"
              >
                <span
                  className="text-[#001a00] group-hover/dropdown:text-[#2e7d32] font-bold text-[10px] tracking-[0.35em] uppercase transition-colors duration-500"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Football Culture
                </span>
                <ChevronDown className="w-3 h-3 text-[#001a00]/40 group-hover/dropdown:text-[#2e7d32] group-hover/dropdown:rotate-180 transition-all duration-500" />
              </Link>

              <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all duration-500">
                <div className="bg-white border border-[#1b5e20]/10 shadow-2xl p-6 min-w-[240px] flex flex-col gap-4">
                  {footballLinks.map((item) => (
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

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[#001a00] hover:text-[#2e7d32] font-bold text-[10px] tracking-[0.35em] uppercase transition-colors duration-500 py-4 flex items-center h-full"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative group/regional">
              <Link
                to="/shop/all"
                className="flex items-center gap-1.5 py-4 cursor-pointer"
              >
                <span
                  className="text-[#001a00] group-hover/regional:text-[#2e7d32] font-bold text-[10px] tracking-[0.35em] uppercase transition-colors duration-500"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Regional Series
                </span>
                <ChevronDown className="w-3 h-3 text-[#001a00]/40 group-hover/regional:text-[#2e7d32] group-hover/regional:rotate-180 transition-all duration-500" />
              </Link>

              <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/regional:opacity-100 group-hover/regional:translate-y-0 group-hover/regional:pointer-events-auto transition-all duration-500">
                <div className="bg-white border border-[#1b5e20]/10 shadow-2xl p-6 min-w-[340px] grid grid-cols-2 gap-x-8 gap-y-4">
                  {regionalCities.map((city) => (
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

          {/* ── Right: Cart & CTA ── */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              to="/checkout"
              className="relative p-2 text-[#001a00] hover:text-[#2e7d32] transition-all duration-300"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {cart.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cart.length}
                  className="absolute -top-1 -right-1 bg-[#2e7d32] text-white text-[8px] md:text-[9px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white"
                >
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </motion.span>
              )}
            </Link>

            <Link
              to="/shop/all"
              className="hidden sm:inline-flex relative overflow-hidden items-center gap-2.5 bg-[#003300] border border-[#1b5e20]/50 text-white px-5 md:px-7 py-2.5 md:py-3.5 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase group/btn"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="relative z-10">Shop Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Sidebar Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#001a00]/60 backdrop-blur-sm z-[250]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[260] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#1b5e20]/10">
                <LogoGakha className="h-10 w-10" color="#013220" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X className="w-6 h-6 text-[#001a00]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <p className="text-[#001a00]/40 text-[9px] font-black tracking-[0.2em] uppercase">Navigation</p>
                  {navLinks.map(link => (
                    <Link 
                      key={link.to} 
                      to={link.to} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[#001a00] text-lg font-bold"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-[#001a00]/40 text-[9px] font-black tracking-[0.2em] uppercase">Football Culture</p>
                  <div className="grid grid-cols-1 gap-3">
                    {footballLinks.map(item => (
                      <Link 
                        key={item.id} 
                        to={`/shop/${item.id}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[#003300]/70 text-sm font-bold"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-[#001a00]/40 text-[9px] font-black tracking-[0.2em] uppercase">Regional Series</p>
                  <div className="grid grid-cols-2 gap-3">
                    {regionalCities.slice(0, 10).map(city => (
                      <Link 
                        key={city.id} 
                        to={`/shop/${city.id}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[#003300]/70 text-[11px] font-bold uppercase"
                      >
                        {city.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#1b5e20]/10 bg-gray-50">
                <Link 
                  to="/shop/all" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-[#003300] text-white py-4 text-center block font-bold text-xs tracking-widest rounded-sm"
                >
                  SHOP ALL COLLECTIONS
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
