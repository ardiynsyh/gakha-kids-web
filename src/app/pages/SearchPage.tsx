import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Heart, ShoppingBag, SearchX } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../../lib/supabase';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,details.ilike.%${query}%`);
      
      if (data) setProducts(data);
      setIsLoading(false);
    }
    fetchProducts();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hasil Pencarian: "{query}"</h1>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-gray-400">Sedang mencari...</div>
        ) : products.length > 0 ? (
          products.map((product) => {
            const inWishlist = isInWishlist(product.id);
            return (
              <div key={product.id} className="group relative">
                <div className="relative mb-4 overflow-hidden rounded-3xl bg-gray-50">
                  <div className="aspect-[3/4] relative">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.tag && (
                      <div
                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm text-gray-900 backdrop-blur-sm"
                        style={{ backgroundColor: `${product.color}dd` }}
                      >
                        {product.tag}
                      </div>
                    )}
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
                          }}
                          className="bg-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg">
                          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a 
                          href={product.linktreeUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <ShoppingBag className="w-5 h-5" />
                          <span className="font-medium">Beli di Marketplace</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Product Info */}
                <div 
                  className="space-y-1 mt-4 cursor-pointer"
                  onClick={() => window.open(product.linktreeUrl || "#", "_blank")}
                >
                  <h3 className="text-gray-900 font-medium hover:text-[var(--accent)] transition-colors line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-bold">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50">
            <SearchX className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Maaf, produk tidak ditemukan. Coba gunakan kata kunci lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
