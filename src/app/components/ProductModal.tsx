import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Play, Share2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useWishlist } from '../context/WishlistContext';
import { calculateDiscountBadge } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { SEO } from './SEO';
import { toast } from 'sonner';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [bundleProducts, setBundleProducts] = useState<any[]>([]);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>(product?.image || '');

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product]);

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
    setIsPlayingVideo(false);
  }, [isOpen, product]);

  if (!product) return null;

  const discount = calculateDiscountBadge(product.price, product.originalPrice);
  const galleryImages = [product.image, product.image2, product.image3, product.image4].filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 lg:p-6">
          <SEO 
            title={product.seoTitle || product.name}
            description={product.seoDescription || `Beli ${product.name} di GAKHA.`}
            image={product.image}
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          <motion.div 
            layoutId={`product-${product.id}`}
            className="bg-white w-full max-w-5xl rounded-[2rem] lg:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row h-full max-h-[95vh] lg:max-h-[750px] border border-gray-100"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-40 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-full transition-all text-white lg:text-gray-400 lg:hover:bg-gray-100 border border-white/30 lg:border-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Section */}
            <div className="lg:w-[45%] relative h-[40vh] lg:h-auto bg-gray-50 overflow-hidden flex-shrink-0">
               <div className="w-full h-full relative">
                 <AnimatePresence mode="wait">
                    {isPlayingVideo && product.video ? (
                      <motion.div key="vid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black">
                         <video src={product.video} autoPlay controls className="w-full h-full object-cover" onEnded={() => setIsPlayingVideo(false)} />
                      </motion.div>
                    ) : (
                      <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                         <ImageWithFallback src={selectedImage} alt={product.name} className="w-full h-full object-contain p-2 lg:p-6" />
                         {product.video && (
                           <button onClick={() => setIsPlayingVideo(true)} className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Play className="w-6 h-6 text-white fill-white" /></div>
                           </button>
                         )}
                      </motion.div>
                    )}
                 </AnimatePresence>
                 {discount && <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1.5 rounded-full font-black text-[10px] shadow-lg z-10">{discount}</div>}
               </div>

               {/* Thumbnails */}
               {galleryImages.length > 1 && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 z-10">
                   {galleryImages.map((img, idx) => (
                     <button key={idx} onClick={() => { setSelectedImage(img); setIsPlayingVideo(false); }} className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60'}`}>
                       <img src={img} className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Content Section */}
            <div className="lg:w-[55%] p-6 lg:p-12 flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white">
               <div className="mb-8">
                  <div className="flex flex-wrap gap-2 mb-3">
                     {product.categories?.map((cat: string) => (
                        <span key={cat} className="text-[8px] font-black uppercase tracking-tighter text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded-md border border-[var(--accent)]/10">{cat}</span>
                     ))}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-2 uppercase">{product.name}</h2>
                  <div className="flex items-center gap-3">
                     <span className="text-2xl font-black text-[var(--accent)]">Rp {typeof product.price === 'number' ? product.price.toLocaleString('id-ID') : product.price}</span>
                     {product.originalPrice && <span className="text-sm text-gray-400 line-through opacity-60 italic">Rp {product.originalPrice}</span>}
                  </div>
               </div>

               <div className="space-y-6 lg:space-y-8 mb-10">
                  <div>
                     <h4 className="text-[9px] font-black uppercase text-gray-400 mb-3 tracking-widest">Pilih Ukuran</h4>
                     <div className="flex flex-wrap gap-2">
                         {product.sizes?.map((size: string) => {
                           const stock = product.inventory?.[size] ?? 0;
                           const isOutOfStock = stock <= 0;
                           return (
                             <button
                               key={size}
                               disabled={isOutOfStock}
                               onClick={() => setSelectedSize(size)}
                               className={`relative px-4 py-3 rounded-xl border-2 font-black transition-all flex flex-col items-center min-w-[65px] ${
                                 selectedSize === size
                                   ? 'bg-black text-white border-black shadow-lg scale-105'
                                   : isOutOfStock
                                     ? 'bg-gray-50 text-gray-300 border-transparent opacity-40 cursor-not-allowed'
                                     : 'bg-gray-50 text-gray-900 border-transparent hover:border-gray-200'
                               }`}
                             >
                               <span className="text-[11px]">{size}</span>
                               <span className={`text-[8px] font-bold ${isOutOfStock ? 'text-red-400' : 'opacity-40 uppercase'}`}>{isOutOfStock ? 'Habis' : `${stock} pcs`}</span>
                               {selectedSize === size && <motion.div layoutId="sz" className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#2e7d32] rounded-full border-2 border-white shadow-sm" />}
                             </button>
                           );
                         })}
                     </div>
                  </div>

                   <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => {
                          if (!selectedSize) { toast.error('Silakan pilih ukuran'); return; }
                          addToCart(product, selectedSize);
                        }}
                        className="flex-1 bg-gray-950 hover:bg-[#2e7d32] text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                      >
                         <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" /> Tambah Ke Keranjang
                      </button>
                      <div className="flex gap-3">
                        <button onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)} className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isInWishlist(product.id) ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}>
                           <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all border border-transparent">
                           <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
               </div>

               {bundleProducts.length > 0 && (
                  <div className="mt-auto pt-8 border-t border-gray-100">
                     <h4 className="text-[9px] font-black uppercase text-gray-900 mb-4 flex items-center justify-between tracking-widest">
                        <span>✨ Shop The Look</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                     </h4>
                     <div className="grid grid-cols-2 gap-3">
                        {bundleProducts.map((p) => (
                           <div key={p.id} className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                 <img src={p.image} className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="overflow-hidden">
                                 <h5 className="font-bold text-[10px] truncate">{p.name}</h5>
                                 <p className="text-[9px] font-black text-[#2e7d32]">{p.price}</p>
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
