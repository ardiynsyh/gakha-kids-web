import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Play, Ruler, Share2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useWishlist } from '../context/WishlistContext';
import { calculateDiscountBadge } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [bundleProducts, setBundleProducts] = useState<any[]>([]);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    if (isOpen && product?.bundleIds?.length > 0) {
      async function fetchBundles() {
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', product.bundleIds);
        if (data) setBundleProducts(data);
      }
      fetchBundles();
    }
    // Reset video state when modal opens/closes
    setIsPlayingVideo(false);
  }, [isOpen, product]);

  if (!product) return null;

  const discount = calculateDiscountBadge(product.price, product.originalPrice);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            layoutId={`product-${product.id}`}
            className="bg-[var(--bg-primary)] w-full max-w-6xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row h-full max-h-[90vh] lg:h-[800px]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors text-white lg:text-gray-400 lg:hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Portion: Media (Image/Video) */}
            <div className="lg:w-1/2 relative h-[400px] lg:h-full bg-slate-50 overflow-hidden group">
               <AnimatePresence mode="wait">
                  {isPlayingVideo && product.video ? (
                    <motion.div 
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black"
                    >
                       <video 
                         src={product.video} 
                         autoPlay 
                         controls 
                         className="w-full h-full object-cover"
                         onEnded={() => setIsPlayingVideo(false)}
                       />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                    >
                       <ImageWithFallback 
                         src={product.image} 
                         alt={product.name}
                         className="w-full h-full object-cover"
                       />
                       {product.video && (
                         <button 
                           onClick={() => setIsPlayingVideo(true)}
                           className="absolute inset-0 flex items-center justify-center group/play"
                         >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center group-hover/play:scale-110 transition-transform">
                               <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                         </button>
                       )}
                    </motion.div>
                  )}
               </AnimatePresence>
               
               {discount && (
                 <div className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-xl">
                   {discount} OFF
                 </div>
               )}

               <div className="absolute bottom-8 left-8 flex gap-3">
                  <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-colors">
                     <Share2 className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Right Portion: Content */}
            <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col h-full overflow-y-auto custom-scrollbar">
               <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                     {product.categories?.map((cat: string) => (
                        <span key={cat} className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
                           {cat}
                        </span>
                     ))}
                  </div>
                  <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-4">{product.name}</h2>
                  <div className="flex items-center gap-4">
                     <span className="text-3xl font-black text-[var(--accent)]">{product.price}</span>
                     {product.originalPrice && (
                        <span className="text-xl text-[var(--text-secondary)] line-through opacity-40">{product.originalPrice}</span>
                     )}
                  </div>
               </div>

               <div className="space-y-8 mb-12">
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">Pilih Ukuran Tersedia</h4>
                     <div className="flex flex-wrap gap-2">
                        {product.sizes?.map((size: string) => (
                           <button key={size} className="w-12 h-12 flex items-center justify-center border-2 border-[var(--border-color)] rounded-xl font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                              {size}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <a 
                       href={product.linktreeUrl || "#"} 
                       target="_blank"
                       className="flex-1 bg-[var(--text-primary)] hover:bg-[var(--accent)] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                     >
                        <ShoppingBag className="w-5 h-5" /> Beli di Marketplace
                     </a>
                     <button 
                       onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                       className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 transition-all ${isInWishlist(product.id) ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-transparent text-gray-400'}`}
                     >
                        <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                     </button>
                  </div>
               </div>

               {/* "Shop The Look" / Related Products */}
               {bundleProducts.length > 0 && (
                  <div className="mt-auto pt-10 border-t border-[var(--border-color)]">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center justify-between">
                        <span>✨ Shop The Look (Bundling)</span>
                        <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
                     </h4>
                     <div className="grid grid-cols-2 gap-4">
                        {bundleProducts.map((p) => (
                           <div key={p.id} className="flex gap-4 items-center bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)] hover:shadow-md transition-shadow group cursor-pointer">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white">
                                 <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="overflow-hidden">
                                 <h5 className="font-bold text-xs truncate">{p.name}</h5>
                                 <p className="text-[10px] font-black text-[var(--accent)]">{p.price}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
