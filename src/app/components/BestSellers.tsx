import { products } from '../../data/products';
import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function BestSellers() {
  const displayedProducts = products.slice(3, 7);

  return (
    <section className="py-12 sm:py-20 bg-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title & See All Button */}
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Best Seller</h2>
         <Link to="/shop/sale" className="bg-[#111111] text-white px-6 py-2 rounded-full text-sm hover:opacity-80 font-semibold tracking-wide transition-opacity">See All</Link>
      </div>

      {/* Vertical Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         {displayedProducts.map((product, idx) => {
            // Mock reviews (3k, 2k, dll)
            const mockReviews = ["3k Reviews", "2k Reviews", "5k Reviews", "5k Reviews"][idx] || "1k Reviews";

            return (
              <div 
                key={product.id} 
                className="group cursor-pointer flex flex-col" 
                onClick={() => window.open(product.linktreeUrl || "#")}
              >
                 {/* Image Gradient Container */}
                 <div className="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-3 bg-gradient-to-br from-[#d3202e] to-[#ed843b] pt-6 px-4 flex items-end justify-center relative">
                    <ImageWithFallback 
                      src={product.image} 
                      className="w-full h-[95%] object-cover object-top rounded-t-[1rem] mix-blend-normal drop-shadow-xl group-hover:scale-105 transition-transform duration-500" 
                    />
                 </div>
                 
                 {/* Text Content */}
                 <div className="px-1">
                   <h3 className="font-bold text-sm sm:text-base text-black leading-tight tracking-tight">{product.name}</h3>
                   <div className="flex items-center gap-1.5 my-1">
                      <div className="flex text-[#ffb000] text-[10px] sm:text-[11px]">
                         {'★'.repeat(product.rating || 5)}{'☆'.repeat(5 - (product.rating || 5))}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-medium text-gray-500">({mockReviews})</span>
                   </div>
                   <p className="font-bold text-black text-xs sm:text-sm">{product.price}</p>
                 </div>
              </div>
            )
         })}
      </div>
    </section>
  )
}
