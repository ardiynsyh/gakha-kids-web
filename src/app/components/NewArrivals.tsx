import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';

// ── Fallback products when Supabase is unavailable ─────────────────────────
const FALLBACK: Record<string, unknown>[] = [
  {
    id: 'f1', name: 'GAKHA Signature Hoodie', price: 'Rp 425.000',
    categories: ['Penawaran Spesial'], material: 'Heavy Cotton Fleece',
    image: '/streetwear_hoodie_green_1776249019216.png',
  },
  {
    id: 'f2', name: 'Urban Terrace Jacket', price: 'Rp 545.000',
    categories: ['Penawaran Spesial'], material: 'Water Repellent Drifit',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
  },
  {
    id: 'f3', name: 'Tribal Culture Tee', price: 'Rp 185.000',
    categories: ['Penawaran Spesial'], material: 'Cotton Combed 24s',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    id: 'f4', name: 'Terrace Cargo Shorts', price: 'Rp 275.000',
    categories: ['Penawaran Spesial'], material: 'Ripstop Canvas',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
  },
];

// ── 3D Rotary Carousel ─────────────────────────────────────────────────────
function ProductGrid({ products }: { products: Record<string, unknown>[] }) {
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
            {/* Quick action overlay */}
            <div className="absolute inset-0 bg-[#003300]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="p-5 flex flex-col items-center text-center">
            <span className="text-[#2e7d32] text-[8px] font-black tracking-[0.4em] uppercase mb-2">
              Penawaran Spesial
            </span>
            <h4 className="text-sm font-bold text-[#001a00] mb-1 uppercase tracking-wider line-clamp-1">
              {String(p.name ?? '')}
            </h4>
            <p className="text-sm font-black text-[#2e7d32] mb-5">
              {typeof p.price === 'number' ? `Rp ${p.price.toLocaleString('id-ID')}` : String(p.price)}
            </p>
            
            <button className="w-full bg-[#003300] text-white py-3.5 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#2e7d32] transition-all flex items-center justify-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function NewArrivals() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .contains('categories', ['Penawaran Spesial'])
          .order('id', { ascending: false });
        setProducts(data && data.length > 0 ? data.slice(0, 5) : FALLBACK);
      } catch {
        setProducts(FALLBACK);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchProducts();
  }, []);

  const displayProducts = products.length > 0 ? products : FALLBACK;

  return (
    <section
      className="py-36 bg-white relative overflow-hidden font-sans border-t border-[#e2e8f0]"
      id="terrace-wear"
    >
      {/* Top / bottom shadow fades */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

      {/* Ambient forest green bloom */}
      <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] rounded-full bg-[#e8f5e9] blur-[220px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-20">

        {/* ── Section Header ──────────────────────────────────────────── */}
        <motion.div
          className="mb-24 relative text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Ghost watermark text */}
          <h2
            className="text-[clamp(1.5rem,8vw,7rem)] font-black text-[#001a00]/[0.03] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none uppercase"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            PENAWARAN SPESIAL
          </h2>

          <span
            className="text-[#2e7d32] text-[10px] font-black tracking-[0.5em] uppercase block mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The Collection
          </span>
          <h3
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#001a00] leading-tight tracking-tight relative z-10 mt-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Penawaran{' '}
            <span className="text-[#2e7d32]">Spesial</span>
          </h3>
          <p
            className="text-[#003300]/60 mt-5 max-w-md mx-auto text-sm leading-relaxed font-medium"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Dapatkan koleksi pilihan terbaik kami dengan harga spesial.
            Penawaran terbatas untuk produk GAKHA Streetwear &amp; Terrace Wear.
          </p>
        </motion.div>

        {/* ── 4-Card Grid ── */}
        {isLoaded ? (
          <ProductGrid products={displayProducts.slice(0, 4)} />
        ) : (
          <div className="flex justify-center items-center h-[400px]">
            <motion.div
              className="w-8 h-8 border-2 border-[#2e7d32] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
