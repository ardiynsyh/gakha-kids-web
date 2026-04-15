import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

// ── Fallback products ────────────────────────────────────────────────────────
const FALLBACK: Record<string, any>[] = [
  {
    id: 'f1', name: 'GAKHA Signature Hoodie', price: 425000,
    categories: ['New Drop'], image: '/streetwear_hoodie_green_1776249019216.png',
  },
  {
    id: 'f2', name: 'Urban Terrace Jacket', price: 545000,
    categories: ['Football Culture'], image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
  },
  {
    id: 'f3', name: 'Tribal Culture Tee', price: 185000,
    categories: ['Regional Series'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    id: 'f4', name: 'Terrace Cargo Shorts', price: 275000,
    categories: ['Aksesoris'], image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
  },
];

function ProductGrid({ products }: { products: Record<string, any>[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((p) => (
        <motion.div
          key={String(p.id)}
          className="flex flex-col bg-white border border-[#1b5e20]/5 group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <ImageWithFallback
              src={String(p.image ?? '')}
              alt={String(p.name ?? '')}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#003300]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="p-5 flex flex-col items-center text-center">
            <span className="text-[#2e7d32] text-[8px] font-black tracking-[0.4em] uppercase mb-2">
              {p.categories?.[0] || 'GAKHA CURATED'}
            </span>
            <h4 className="text-sm font-bold text-[#001a00] mb-1 uppercase tracking-wider line-clamp-1">
              {String(p.name ?? '')}
            </h4>
            <p className="text-sm font-black text-[#2e7d32] mb-5">
               Rp {typeof p.price === 'number' ? p.price.toLocaleString('id-ID') : p.price}
            </p>
            
            <button className="w-full bg-[#003300] text-white py-3.5 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#2e7d32] transition-all flex items-center justify-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Beli Sekarang
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function NewArrivals() {
  const { config } = useStore();
  const [products, setProducts] = useState<Record<string, any>[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const featuredIds = config.featuredProducts || [];
        
        let query = supabase.from('products').select('*');
        
        if (featuredIds.length > 0) {
          query = query.in('id', featuredIds);
        } else {
          // Default fallback to show something from DB
          query = query.contains('categories', ['Football Culture']).limit(4);
        }

        const { data } = await query;
        setProducts(data && data.length > 0 ? data : FALLBACK);
      } catch {
        setProducts(FALLBACK);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchFeatured();
  }, [config.featuredProducts]);

  return (
    <section className="py-36 bg-white relative overflow-hidden font-sans border-t border-[#e2e8f0]" id="curated-collection">
      <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] rounded-full bg-[#e8f5e9] blur-[220px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-20">
        <motion.div
          className="mb-24 relative text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-[clamp(1.5rem,8vw,7rem)] font-black text-[#001a00]/[0.03] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none uppercase">
            CURATED SELECTION
          </h2>

          <span className="text-[#2e7d32] text-[10px] font-black tracking-[0.5em] uppercase block mb-3">
             Your Terrace Identity
          </span>
          <h3 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#001a00] leading-tight tracking-tight relative z-10 mt-6">
            Pilihan <span className="text-[#2e7d32]">Koleksi Utama</span>
          </h3>
          <p className="text-[#003300]/60 mt-5 max-w-md mx-auto text-sm leading-relaxed font-medium">
            Kurasi produk terbaik GAKHA Market pilihan tim kami. Mulai dari Football Culture hingga Regional Series.
          </p>
        </motion.div>

        {isLoaded ? (
          <ProductGrid products={products.slice(0, 4)} />
        ) : (
          <div className="flex justify-center items-center h-[400px]">
            <motion.div className="w-8 h-8 border-2 border-[#2e7d32] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          </div>
        )}
      </div>
    </section>
  );
}
