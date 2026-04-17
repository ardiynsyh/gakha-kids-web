import { Link, useNavigate } from 'react-router';
import { ChevronDown, ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { LogoGakha } from './LogoGakha';

export function NavigationBar() {
  const { cart } = useCart();
  const { config } = useStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchVisible(false);
      setSearchQuery('');
    }
  };

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
    <header className={`fixed top-0 left-0 w-full z-[200] transition-all duration-500 font-sans`}>
      {/* Announcement Bar */}
      <div className="bg-[#1b5e20] text-white py-2.5 px-4 text-center relative z-[210] border-b border-white/10">
        <div className="max-w-[1600px] mx-auto overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 whitespace-nowrap">
            <span className="flex items-center gap-2">
              {config.announcement?.text || 'FLASH SALE: DISCOUNT UP TO 50% FOR ALL NEW DROPS | USE CODE: GAKHA2024'}
            </span>
          </p>
        </div>
      </div>

      <div className={`transition-all duration-500 bg-white/95 backdrop-blur-md border-b border-[#1b5e20]/10 ${isScrolled ? 'py-3' : 'py-5'}`}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Mobile hamburger & search */}
          <div className="flex items-center gap-2 md:hidden min-w-[80px]">
            <button className="p-2 text-[#001a00]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <button className="p-2 text-[#001a00]" onClick={() => setIsSearchVisible(!isSearchVisible)}>
              <Search className="w-5 h-5" />
            </button>
          </div>

          <Link to="/" className="group cursor-pointer md:relative md:left-0 md:translate-x-0 absolute left-1/2 -translate-x-1/2">
            <LogoGakha className="h-12 md:h-16 w-12 md:w-16" color="#013220" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5 lg:gap-8">
            {/* Football Culture Dropdown */}
            <div className="relative group/dropdown">
              <Link to="/shop/all" className="flex items-center gap-1 py-4">
                <span className="text-[#001a00] group-hover/dropdown:text-[#2e7d32] font-bold text-[9px] lg:text-[11px] tracking-widest uppercase transition-colors">Football Culture</span>
                <ChevronDown className="w-3 h-3 opacity-40 group-hover/dropdown:rotate-180 transition-transform" />
              </Link>
              <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all">
                <div className="bg-white border border-gray-100 shadow-xl p-5 min-w-[220px] rounded-xl flex flex-col gap-3">
                  {footballLinks.map(item => (
                    <Link key={item.id} to={`/shop/${item.id}`} className="text-[#003300]/60 hover:text-[#2e7d32] text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-between group/link">
                      <span>{item.label}</span>
                      <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.map(link => (
              <Link key={link.label} to={link.to} className="text-[#001a00] hover:text-[#2e7d32] font-bold text-[9px] lg:text-[11px] tracking-widest uppercase transition-colors py-4">
                {link.label}
              </Link>
            ))}

            {/* Regional Dropdown */}
            <div className="relative group/regional">
              <Link to="/shop/all" className="flex items-center gap-1 py-4">
                <span className="text-[#001a00] group-hover/regional:text-[#2e7d32] font-bold text-[9px] lg:text-[11px] tracking-widest uppercase transition-colors">Regional Series</span>
                <ChevronDown className="w-3 h-3 opacity-40 group-hover/regional:rotate-180 transition-transform" />
              </Link>
              <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/regional:opacity-100 group-hover/regional:translate-y-0 group-hover/regional:pointer-events-auto transition-all">
                <div className="bg-white border border-gray-100 shadow-xl p-5 min-w-[340px] rounded-xl grid grid-cols-2 gap-x-8 gap-y-3">
                  {regionalCities.map(city => (
                    <Link key={city.id} to={`/shop/${city.id}`} className="text-[#003300]/60 hover:text-[#2e7d32] text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-between group/link">
                      <span>{city.label}</span>
                      <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4 md:min-w-0 min-w-[80px] justify-end">
            <form onSubmit={handleSearch} className="hidden xl:flex items-center relative">
              <input type="text" placeholder="Cari..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-gray-100/80 rounded-full py-2 pl-4 pr-10 text-[10px] font-bold uppercase tracking-widest w-[120px] focus:w-[180px] transition-all outline-none" />
              <button type="submit" className="absolute right-3 text-gray-400"><Search className="w-3.5 h-3.5" /></button>
            </form>
            
            <button className="hidden md:flex xl:hidden p-2 text-[#001a00]" onClick={() => setIsSearchVisible(!isSearchVisible)}>
              <Search className="w-5 h-5" />
            </button>

            <Link to="/checkout" className="relative p-2 text-[#001a00]">
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#2e7d32] text-white text-[9px] font-black w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
            </Link>

            <Link to="/shop/all" className="hidden lg:inline-flex bg-[#003300] text-white px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-sm hover:bg-[#2e7d32] transition-colors">Shop Now</Link>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden px-4 py-3 bg-white border-t border-gray-100 overflow-hidden">
              <form onSubmit={handleSearch} className="relative">
                <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus className="w-full bg-gray-50 rounded-xl py-3.5 pl-5 pr-12 text-xs font-bold uppercase tracking-widest outline-none" />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2e7d32]"><Search className="w-5 h-5" /></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[260] shadow-2xl flex flex-col">
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <LogoGakha className="h-10 w-10" color="#013220" />
                <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Navigation</p>
                  {navLinks.map(l => <Link key={l.to} to={l.to} onClick={()=>setIsMobileMenuOpen(false)} className="block text-lg font-bold text-[#001a00]">{l.label}</Link>)}
                </div>
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Culture</p>
                  <div className="space-y-3">
                    {footballLinks.map(i => <Link key={i.id} to={`/shop/${i.id}`} onClick={()=>setIsMobileMenuOpen(false)} className="block text-sm font-bold text-[#003300]/70 uppercase">{i.label}</Link>)}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Regional</p>
                  <div className="grid grid-cols-2 gap-3">
                    {regionalCities.slice(0, 10).map(c => <Link key={c.id} to={`/shop/${c.id}`} onClick={()=>setIsMobileMenuOpen(false)} className="block text-[11px] font-bold text-[#003300]/70 uppercase">{c.label}</Link>)}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <Link to="/shop/all" onClick={()=>setIsMobileMenuOpen(false)} className="block w-full bg-[#003300] text-white py-4 text-center font-bold text-xs rounded-sm">SHOP ALL</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
