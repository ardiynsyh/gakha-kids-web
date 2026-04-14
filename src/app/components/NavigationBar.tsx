import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, X, Moon, Sun, ChevronDown, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnouncementBar } from './AnnouncementBar';
import { FlashSaleTimer } from './FlashSaleTimer';

export function NavigationBar() {
  const { config } = useStore();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 w-full z-50 flex flex-col font-sans transition-all duration-300 ${isScrolled ? 'bg-[var(--bg-primary)]/80 backdrop-blur-xl shadow-sm border-b border-[var(--border-color)]' : 'bg-[var(--bg-primary)]'}`}
    >
      <AnnouncementBar />
      <FlashSaleTimer />

      {/* Main Header Row */}
      <div className={`max-w-[1800px] mx-auto px-[clamp(1rem,5vw,4rem)] w-full transition-all duration-300 ${isScrolled ? 'py-1 sm:py-3' : 'py-1.5 sm:py-5'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-0">
          
          {/* Top Row for Mobile (Logo & Icons) */}
          <div className="flex items-center justify-between w-full sm:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg shadow-sm`}
              />
               <span className={`font-black tracking-tighter text-[var(--text-primary)] font-serif italic uppercase leading-none ${isScrolled ? 'text-lg' : 'text-xl'}`}>
                  {config?.name?.prefix}<span className="text-[var(--accent)]">{config?.name?.highlight}</span>
               </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="relative">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>}
              </Link>
               <Link to="/checkout" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold tracking-tighter">{totalItems}</span>}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search & Theme - Second Row on Mobile, Left on Desktop */}
          <div className={`${isScrolled && 'sm:flex'} w-full sm:w-[35%] flex items-center justify-start gap-4 order-2 sm:order-1`}>
             <form onSubmit={handleSearch} className="relative flex items-center w-full max-w-full sm:max-w-[280px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full overflow-hidden transition-all focus-within:shadow-sm focus-within:border-[var(--accent)]/50">
               <input 
                 type="text" 
                 placeholder="Cari..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-transparent py-2.5 sm:py-2 pl-5 sm:pl-6 pr-12 text-[12px] sm:text-[13px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/50"
               />
               <button type="submit" className="absolute right-1 top-1 bottom-1 bg-[var(--accent)] hover:opacity-90 text-white px-4 sm:px-5 rounded-full transition-opacity flex items-center justify-center">
                 <Search className="w-3.5 h-3.5 stroke-[3]" />
               </button>
             </form>
             
             {/* Dark Mode Toggle - Hidden on very small mobile if space is tight, but here it's fine */}
             <button 
               onClick={toggleTheme}
               className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors shadow-inner"
             >
               {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
             </button>
          </div>

          {/* Center: Logo (Desktop Only) */}
          <div className="hidden sm:flex flex-col items-center justify-center w-[30%] order-2">
            <Link to="/" className="flex flex-col items-center group transition-all duration-500">
              <motion.div 
                animate={{ 
                  width: isScrolled ? 60 : 100,
                  height: isScrolled ? 60 : 100 
                }}
                className="relative mb-1 flex items-center justify-center p-2"
              >
                <img 
                  src="/logo.png" 
                  alt="Gakha Kids Logo" 
                  className="relative z-10 w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100"
                />
              </motion.div>
              <div className="flex flex-col items-center">
                 <span className={`font-black tracking-tighter text-[var(--text-primary)] font-serif italic uppercase leading-[0.8] drop-shadow-sm group-hover:text-[var(--accent)] transition-all duration-300 ${isScrolled ? 'text-[24px] sm:text-[28px]' : 'text-[34px] sm:text-[38px]'}`}>
                    {config?.name?.prefix}<span className="text-[var(--accent)]">{config?.name?.highlight}</span>
                 </span>
                 {!isScrolled && (
                   <motion.span 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.6, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[10px] font-bold tracking-[0.4em] text-[var(--text-secondary)] uppercase mt-2"
                   >
                     Dunia Penuh Keceriaan Anak
                   </motion.span>
                 )}
              </div>
            </Link>
          </div>

          {/* Right: Icons (Desktop Only) */}
          <div className="hidden sm:flex w-[35%] items-center justify-end gap-6 order-3">
             <Link to="/wishlist" className="hover:text-[var(--accent)] text-[var(--text-primary)] transition-colors relative cursor-pointer block">
               <Heart className="w-5 h-5 stroke-[1.5]" />
               {wishlist.length > 0 && (
                 <span className="absolute -top-1.5 -right-2 bg-[var(--accent)] text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-md">
                   {wishlist.length}
                 </span>
               )}
             </Link>

              <Link to="/checkout" className="flex items-center text-[var(--text-primary)] cursor-pointer group">
                 <div className="flex items-center gap-3">
                    <div className="relative hover:text-[var(--accent)] transition-colors">
                       <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                       {totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-[var(--accent)] text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-md">
                          {totalItems}
                        </span>
                       )}
                    </div>
                    <div className="hidden sm:flex flex-col">
                       <span className="text-[11px] font-bold">Tas ({totalItems})</span>
                    </div>
                 </div>
              </Link>

             <button 
               className="lg:hidden p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors ml-2 text-[var(--text-primary)]"
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
               {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
             </button>
          </div>
        </div>
      </div>

      {/* Bottom Menu Navigation */}
      <div className="hidden lg:flex items-center justify-center pb-6 pt-2">
         <div className="flex items-center space-x-10">
            {/* Dynamic Categories Dropdown */}
            <div 
              className="relative group h-full"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
               <button className="flex items-center gap-1.5 text-[15px] font-black text-[var(--accent)] hover:opacity-80 transition-all uppercase tracking-tighter hover:scale-105 active:scale-95 group">
                  <span className="bg-[var(--accent)]/10 px-3 py-1 rounded-full flex items-center gap-2">
                    KATEGORI <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </span>
               </button>

               <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64 z-[100]"
                    >
                       <div className="bg-[var(--bg-primary)] p-4 rounded-[2rem] shadow-2xl border border-[var(--border-color)] overflow-hidden">
                          <div className="space-y-1">
                             {(!config?.productCategories || config.productCategories.length === 0) ? (
                               <div className="p-4 text-center">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase">Belum ada kategori</p>
                                 <Link to="/admin" className="text-[9px] text-[var(--accent)] underline mt-1 block">Atur di Admin</Link>
                               </div>
                             ) : (
                               config.productCategories.map((cat: any) => (
                                 <Link 
                                   key={cat.id} 
                                   to={`/shop/${cat.id}`}
                                   className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] text-[13px] font-bold text-[var(--text-primary)] transition-all"
                                   onClick={() => setIsCategoryOpen(false)}
                                 >
                                   <span className="text-lg leading-none">🏷️</span>
                                   <span className="flex-1">{cat.name}</span>
                                   <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                 </Link>
                               ))
                             )}
                             <div className="pt-2 mt-2 border-t border-[var(--border-color)]">
                                <Link to="/shop/all" className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest text-center block py-2 hover:opacity-70">Lihat Semua Produk &rarr;</Link>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {config?.navigation?.links?.map((link: any, index: number) => (
              <Link key={index} to={link.href} className="flex items-center gap-1 text-[15px] font-black text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all uppercase tracking-tighter hover:scale-105 active:scale-95">
                {link.label}
              </Link>
            ))}
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
                {/* Mobile Categories Accordion */}
                <div className="border-b border-[var(--border-color)]">
                   <button 
                    onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-[13px] font-black text-[var(--text-primary)] uppercase"
                   >
                      KATEGORI <ChevronDown className={`w-4 h-4 transition-transform ${isMobileCategoryOpen ? 'rotate-180' : ''}`} />
                   </button>
                   <AnimatePresence>
                      {isMobileCategoryOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[var(--bg-secondary)]/50 rounded-2xl mx-1 mb-2"
                        >
                           {config?.productCategories?.map((cat: any) => (
                             <Link 
                               key={cat.id} 
                               to={`/shop/${cat.id}`}
                               className="block px-6 py-3 text-[12px] font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]/50 last:border-0"
                               onClick={() => setIsMobileMenuOpen(false)}
                             >
                               {cat.name}
                             </Link>
                           ))}
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

              {config?.navigation?.links?.map((link: any, index: number) => (
                  <Link 
                  key={index} 
                  to={link.href} 
                  className="block px-4 py-3.5 border-b border-[var(--border-color)] text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] uppercase transition-colors flex justify-between items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
