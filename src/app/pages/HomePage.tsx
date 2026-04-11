import { HeroBanner } from '../components/HeroBanner';
import { Features } from '../components/Features';
import { TopDeals } from '../components/TopDeals';
import { NewArrivals } from '../components/NewArrivals';
import { Testimonials } from '../components/Testimonials';

export function HomePage() {
  return (
    <div className="bg-[var(--bg-primary)] overflow-x-hidden transition-colors duration-300">
      <HeroBanner />
      <Features />
      <TopDeals />
      <NewArrivals />
      <Testimonials />
    </div>
  );
}
