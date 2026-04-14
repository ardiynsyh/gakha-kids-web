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
      
      <main className="flex-1 pt-[240px] lg:pt-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            className="w-full h-full transform-gpu origin-top"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}
