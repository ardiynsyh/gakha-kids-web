import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router';

export function AnnouncementBar() {
  const { config } = useStore();
  const announcement = config?.announcement;

  if (!announcement || !announcement.isEnabled) return null;

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="relative overflow-hidden z-[60]"
      style={{ background: '#FF3D00' }}
    >
      {/* Stripe pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, #000 8px, #000 10px)'
        }}
      />
      
      <div className="relative max-w-[1800px] mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-center text-center">
        <Link 
          to={announcement.link || '#'} 
          className="group flex items-center justify-center gap-3 text-[10px] sm:text-[12px] font-black tracking-[0.15em] uppercase text-white"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          <span className="opacity-70 hidden sm:inline">⚽</span>
          <span className="transition-all duration-300 group-hover:tracking-[0.2em]">
            {announcement.text}
          </span>
          <span className="opacity-70 hidden sm:inline">⚽</span>
        </Link>
      </div>
    </motion.div>
  );
}
