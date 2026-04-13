import { HeroBanner } from '../components/HeroBanner';
import { Features } from '../components/Features';
import { TopDeals } from '../components/TopDeals';
import { NewArrivals } from '../components/NewArrivals';
import { Testimonials } from '../components/Testimonials';

import { SEO } from '../components/SEO';

export function HomePage() {
  return (
    <div className="bg-[var(--bg-primary)] overflow-x-hidden transition-colors duration-300">
      <SEO 
        title="Beranda" 
        description="Gakha Kids - Koleksi pakaian anak premium, modern, dan nyaman. Temukan baju bayi, toddler, dan aksesori anak terbaik di toko kami."
      />
      <HeroBanner />
      <Features />
      <TopDeals />
      <NewArrivals />
      <Testimonials />
    </div>
  );
}
