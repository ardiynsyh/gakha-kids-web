import { NavigationBar } from './components/NavigationBar';
import { HeroBanner } from './components/HeroBanner';
import { Features } from './components/Features';
import { NewArrivals } from './components/NewArrivals';
import { Footer } from './components/Footer';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <NavigationBar />
      <main className="pt-[130px] sm:pt-[200px]">
        <HeroBanner />
        <Features />
        <NewArrivals />
        <Footer />
      </main>
    </div>
  );
}