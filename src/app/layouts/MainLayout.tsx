import { NavigationBar } from '../components/NavigationBar';
import { Footer } from '../components/Footer';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-center" richColors />
      <NavigationBar />
      <main className="flex-1 pt-[160px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
