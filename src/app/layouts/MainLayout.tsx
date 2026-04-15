import { NavigationBar } from '../components/NavigationBar';
import { Footer } from '../components/Footer';
import { Toaster } from 'sonner';
import { Outlet, useLocation } from 'react-router';
import { NewsletterPopup } from '../components/NewsletterPopup';
import { motion, AnimatePresence } from 'framer-motion';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col transition-colors duration-500">
      <Toaster position="top-center" richColors />
      <NewsletterPopup />
      <NavigationBar />

      {/* ── Fade-to-Forest-Green Page Wipe ─────────────────────────────── */}
      <AnimatePresence>
        <motion.div
          key={`wipe-${location.pathname}`}
          className="fixed inset-0 z-[500] pointer-events-none"
          style={{ background: '#ffffff' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1], delay: 0.08 }}
        />
      </AnimatePresence>

      <main className="flex-1 pt-[240px] lg:pt-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

