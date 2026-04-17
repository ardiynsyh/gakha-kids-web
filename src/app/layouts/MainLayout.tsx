import { NavigationBar } from '../components/NavigationBar';
import { Footer } from '../components/Footer';
import { Toaster } from 'sonner';
import { Outlet, useLocation } from 'react-router';
import { NewsletterPopup } from '../components/NewsletterPopup';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col transition-colors duration-500">
      <Toaster position="top-center" richColors />
      <NewsletterPopup />
      <NavigationBar />

      <main className="flex-1 pt-[160px] lg:pt-[180px] bg-white">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
