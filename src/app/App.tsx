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
      <HeroBanner />
      <Features />
      <NewArrivals />
      <Footer />
    </div>
  );
}