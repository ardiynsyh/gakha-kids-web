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
          className="flex flex-col bg-white border border-gray-100 group relative transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,51,0,0.12)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -12 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <ImageWithFallback
              src={String(p.image ?? '')}
              alt={String(p.name ?? '')}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#003300]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="p-8 flex flex-col items-center text-center relative z-10 bg-white">
            <span className="text-[#2e7d32] text-[8px] font-black tracking-[0.4em] uppercase mb-3 px-3 py-1 bg-green-50 rounded-full">
              {p.categories?.[0] || 'GAKHA CURATED'}
            </span>
            <h4 className="text-sm font-bold text-[#001a00] mb-2 uppercase tracking-tighter line-clamp-1 group-hover:text-[#2e7d32] transition-colors">
              {String(p.name ?? '')}
            </h4>
            <p className="text-lg font-black text-[#001a00] mb-6">
               Rp {typeof p.price === 'number' ? p.price.toLocaleString('id-ID') : p.price}
            </p>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="w-full bg-[#003300] text-white py-4 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#2e7d32] transition-all flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-green-900/10 hover:shadow-green-900/30"
            >
              <ShoppingBag className="w-4 h-4" />
              Beli Sekarang
            </motion.button>
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
            {config.featuredTitle || 'Pilihan Koleksi Utama'}
          </h3>
          <p className="text-[#003300]/60 mt-5 max-w-md mx-auto text-sm leading-relaxed font-medium">
            {config.featuredDescription || 'Kurasi produk terbaik GAKHA Market pilihan tim kami.'}
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
