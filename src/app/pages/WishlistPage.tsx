import { useWishlist } from '../context/WishlistContext';
import { Heart, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist Saya ({wishlist.length})</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl text-gray-700">Daftar keinginan Anda kosong</h2>
          <p className="text-gray-500 mt-2">Mulai simpan pakaian lucu favorit Anda di sini!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {wishlist.map((product) => (
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
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm text-gray-900 backdrop-blur-sm shadow-sm"
                      style={{ backgroundColor: `${product.color}dd` }}
                    >
                      {product.tag}
                    </div>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                    className="bg-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg absolute top-4 right-4 z-10"
                    title="Hapus dari Wishlist"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
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
                className="space-y-1 mt-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(product.linktreeUrl || "#", "_blank")}
              >
                <h3 className="text-gray-900 font-medium hover:text-[var(--mint-green)] transition-colors">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">{product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
