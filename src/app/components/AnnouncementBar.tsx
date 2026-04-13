import { motion } from 'framer-motion';
import { storeConfig } from '../../data/storeConfig';
import { Link } from 'react-router';

export function AnnouncementBar() {
  const { announcement } = storeConfig as any;

  if (!announcement || !announcement.isEnabled) return null;

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-[var(--accent)] text-white overflow-hidden relative z-[60]"
    >
      <div className="max-w-[1800px] mx-auto px-4 py-1.5 sm:py-2.5 flex items-center justify-center text-center">
        <Link 
          to={announcement.link || '#'} 
          className="group flex items-center justify-center gap-2 text-[10px] sm:text-[13px] font-bold tracking-wide uppercase"
        >
          <span className="transition-transform duration-300">
            {announcement.text}
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
