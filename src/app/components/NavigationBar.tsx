import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, X, Moon, Sun } from 'lucide-react';
import { storeConfig } from '../../data/storeConfig';
import { Link, useNavigate } from 'react-router';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnouncementBar } from './AnnouncementBar';

export function NavigationBar() {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

      {/* Main Header Row */}
      <div className={`max-w-[1800px] mx-auto px-[clamp(1.5rem,5vw,4rem)] w-full transition-all duration-300 ${isScrolled ? 'py-2 sm:py-3' : 'py-4 sm:py-5'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-0">
          
          {/* Left: Search Bar & Theme Toggle */}
          <div className="w-full sm:w-[35%] flex items-center justify-start gap-4 order-2 sm:order-1">
             <form onSubmit={handleSearch} className="relative flex items-center w-full max-w-[280px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full overflow-hidden transition-all focus-within:shadow-sm focus-within:border-[var(--accent)]/50">
               <input 
                 type="text" 
                 placeholder="Cari..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-transparent py-2 pl-6 pr-12 text-[13px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/50"
               />
               <button type="submit" className="absolute right-1 top-1 bottom-1 bg-[var(--accent)] hover:opacity-90 text-white px-5 rounded-full transition-opacity flex items-center justify-center">
                 <Search className="w-3.5 h-3.5 stroke-[3]" />
               </button>
             </form>
             
             {/* Dark Mode Toggle */}
             <button 
               onClick={toggleTheme}
               className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors shadow-inner"
             >
               {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
             </button>
          </div>

          {/* Center: Logo */}
          <div className="flex flex-col items-center justify-center w-full sm:w-[30%] order-1 sm:order-2">
            <Link to="/" className="flex flex-col items-center group transition-all duration-500">
              <motion.div 
                animate={{ 
                  width: isScrolled ? 70 : 120,
                  height: isScrolled ? 70 : 120 
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 450, damping: 15 }}
                className="relative mb-1 flex items-center justify-center p-2"
              >
                <img 
                  src="/logo.png" 
                  alt="Gakha Kids Logo" 
                  className="relative z-10 w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100"
                />
              </motion.div>
              <div className="flex flex-col items-center">
                 <span className={`font-black tracking-tighter text-[var(--text-primary)] font-serif italic uppercase leading-[0.8] drop-shadow-sm group-hover:text-[var(--accent)] transition-all duration-300 ${isScrolled ? 'text-[24px] sm:text-[30px]' : 'text-[34px] sm:text-[42px]'}`}>
                    {storeConfig.name.prefix}<span className="text-[var(--accent)]">{storeConfig.name.highlight}</span>
                 </span>
                 {!isScrolled && (
                   <motion.span 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.6, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-bold tracking-[0.4em] text-[var(--text-secondary)] uppercase mt-2"
                   >
                     Dunia Penuh Keceriaan Anak
                   </motion.span>
                 )}
              </div>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="w-full sm:w-[35%] flex items-center justify-center sm:justify-end gap-6 order-3">
             <Link to="/wishlist" className="hover:text-[var(--accent)] text-[var(--text-primary)] transition-colors relative cursor-pointer block">
               <Heart className="w-5 h-5 stroke-[1.5]" />
               {wishlist.length > 0 && (
                 <span className="absolute -top-1.5 -right-2 bg-[var(--accent)] text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-md">
                   {wishlist.length}
                 </span>
               )}
             </Link>

             <div className="flex flex-col items-center sm:items-start text-[var(--text-primary)] cursor-pointer group">
                <div className="flex items-center gap-3">
                   <div className="relative hover:text-[var(--accent)] transition-colors">
                      <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                      <span className="absolute -top-1.5 -right-2 bg-[var(--accent)] text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-md">
                        0
                      </span>
                   </div>
                   <div className="hidden sm:flex flex-col">
                      <span className="text-[11px] font-bold">Tas (0)</span>
                   </div>
                </div>
             </div>

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
            {storeConfig.navigation.links.map((link, index) => (
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
              {storeConfig.navigation.links.map((link, index) => (
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
