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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}
