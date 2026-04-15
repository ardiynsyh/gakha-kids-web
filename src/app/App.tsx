import { NavigationBar } from './components/NavigationBar';
import { HeroBanner } from './components/HeroBanner';
import { Features } from './components/Features';
import { NewArrivals } from './components/NewArrivals';
import { Footer } from './components/Footer';
import { TribalCulture } from './components/TribalCulture';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: { 
            background: '#ffffff', 
            border: '1px solid #1b5e20', 
            color: '#001a00',
            fontFamily: "'Space Grotesk', sans-serif"
          }
        }}
      />
      <NavigationBar />
      <main className="pt-[85px] sm:pt-[200px]">
        <HeroBanner />
        <Features />
        <TribalCulture />
        <NewArrivals />
        <Footer />
      </main>
    </div>
  );
}