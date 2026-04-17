import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Heart, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useWishlist } from '../context/WishlistContext';
import { calculateDiscountBadge } from '../components/ui/utils';
import { SEO } from '../components/SEO';
import { supabase } from '../../lib/supabase';
import { useStore } from '../context/StoreContext';
import { ProductModal } from '../components/ProductModal';

export function ShopPage() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { config } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        let query = supabase.from('products').select('*');
        const activeCat = config?.productCategories?.find((c: any) => c.id === categoryId);
        const isLatestSection = categoryId === 'new' || (activeCat && activeCat.name.toLowerCase().includes('terbaru'));

        if (categoryId && categoryId !== 'all') {
          if (isLatestSection) {
            query = query.contains('categories', ['new']);
          } else {
            query = query.contains('categories', [categoryId.toLowerCase()]);
          }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        if (data) setProducts(data);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId, config?.productCategories]);

  const getTitle = () => {
    const dynamicCat = config?.productCategories?.find((c: any) => c.id === categoryId);
    if (dynamicCat) return dynamicCat.name;

    switch(categoryId) {
      case 'new': return 'New Drop';
      case 'sale': return 'Penawaran Spesial';
      case 'casuals': return 'Koleksi Casuals';
      case 'terrace': return 'Terrace Wear';
      case 'accessories': return 'Aksesoris/Scarf';
      case 'jakarta': return 'Regional: Jakarta';
      case 'bandung': return 'Regional: Bandung';
      case 'surabaya': return 'Regional: Surabaya';
      case 'malang': return 'Regional: Malang';
      case 'bali': return 'Regional: Bali';
      case 'sleman': return 'Regional: Sleman';
      case 'solo': return 'Regional: Solo';
      case 'semarang': return 'Regional: Semarang';
      case 'medan': return 'Regional: Medan';
      case 'jayapura': return 'Regional: Jayapura';
      case 'samarinda': return 'Regional: Samarinda';
      case 'all': return 'Semua Produk';
      default: return 'Koleksi Produk';
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto px-[clamp(1.5rem,5vw,4rem)] py-12 min-h-[60vh]">
      <SEO 
        title={getTitle()} 
        description={`Lihat koleksi ${getTitle()} di GAKHA. Streetwear premium dengan desain otentik budaya supporter.`} 
      />
      <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[var(--text-primary)] mb-8 tracking-tight border-b border-[var(--border-color)] pb-4">{getTitle()}</h1>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 transition-opacity duration-300 ${isLoading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        {!isLoading && products.length === 0 ? (
           <div className="col-span-full py-20 text-center opacity-50 font-bold uppercase tracking-widest text-xs">
              Belum ada produk di kategori ini.
           </div>
        ) : products.length > 0 ? (
          products.map((product) => {
            const dynamicTag = calculateDiscountBadge(product.price, product.originalPrice);
            const tag = dynamicTag || product.tag;
            
            return (
              <div key={product.id} className="group">
                <div className="relative mb-4 overflow-hidden rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] relative">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {tag && (
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-sm ${tag.includes('%') ? 'bg-red-500' : 'bg-[#ffb000]'}`}>
                        {tag}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const inWish = isInWishlist(product.id);
                            inWish ? removeFromWishlist(product.id) : addToWishlist(product);
                          }}
                          className="bg-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg cursor-pointer">
                          <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="w-full bg-white text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          <span className="font-medium">Lihat Detail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div 
                  className="space-y-1 mt-4 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsModalOpen(true);
                  }}
                >
                  <h3 className="text-[var(--text-primary)] font-semibold hover:text-[var(--accent)] transition-colors line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] font-bold text-lg">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[var(--text-secondary)] line-through text-sm">{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Maaf, produk untuk kategori ini belum tersedia.</p>
          </div>
        )}
      </div>

      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
