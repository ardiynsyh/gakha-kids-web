import { products } from '../../data/products';
import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { calculateDiscountBadge } from './ui/utils';

export function NewArrivals() {
  const displayedProducts = products.filter(p => p.categories?.includes('new')).slice(0, 8); 

  return (
    <section className="pb-32 pt-16 px-[clamp(1.5rem,5vw,4rem)] max-w-[1800px] mx-auto font-sans bg-[var(--bg-primary)]">
      
      <div className="flex flex-col lg:flex-row gap-10 relative">
        
        {/* Sticky Sidebar Title */}
        <div className="lg:w-1/4 h-full hidden lg:block">
           <div className="sticky top-32 pt-10">
             <motion.h2 
               initial={{ opacity: 0, x: -30 }} 
               whileInView={{ opacity: 1, x: 0 }} 
               viewport={{ once: true }}
               className="text-[clamp(2rem,4vw,3.5rem)] font-black text-[var(--text-primary)] font-serif italic mb-4 tracking-tighter leading-none"
             >
               Koleksi<br/>Terbaru
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-[200px]"
             >
               Melihat dari dekat karya terbaru kami. Didesain untuk kenyamanan si kecil tanpa mengorbankan gaya modern.
             </motion.p>
             <Link to="/shop/new" className="inline-block border-2 border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest">
               Lihat Semua
             </Link>
           </div>
        </div>

        {/* Mobile Title (Non-sticky) */}
        <div className="lg:hidden text-center mb-8">
           <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold text-[var(--text-primary)] font-serif italic tracking-wide leading-tight">Koleksi Terbaru</h2>
        </div>

        {/* Grid Cards with Neumorphism / Soft Shadow details */}
        <div className="lg:w-3/4 grid grid-cols-[repeat(auto-fit,minmax(clamp(160px,25vw,240px),1fr))] gap-[clamp(1rem,3vw,2rem)]">
           {displayedProducts.map((product, idx) => {
              const dynamicTag = calculateDiscountBadge(product.price, product.originalPrice);
              const tag = dynamicTag || product.tag || (idx < 2 ? "Hot" : "New");
              
              return (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group cursor-pointer flex flex-col items-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-[clamp(0.5rem,1vw,1rem)] shadow-[0_10px_30px_inherit] hover:shadow-[0_20px_40px_inherit] transition-all duration-300"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                >
                   {/* Image Box */}
                   <div className="relative w-full bg-white dark:bg-white rounded-2xl aspect-square mb-4 flex justify-center items-center transition-colors group-hover:bg-gray-50 overflow-hidden shadow-inner">
                      <div className={`absolute top-3 left-3 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-[3px] text-white shadow-sm z-10 ${tag.includes('%') ? 'bg-red-500' : 'bg-[#ffb000]'}`}>
                         {tag}
                      </div>
                      
                      <ImageWithFallback 
                        src={product.image} 
                        className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal group-hover:scale-[1.05] group-hover:-translate-y-1 transition-transform duration-500" 
                      />
                   </div>
                   
                   {/* Text Info */}
                   <div className="text-center w-full px-2 flex flex-col justify-end h-full">
                      <div className="flex justify-center items-center gap-1.5 mb-1.5">
                         <div className="flex text-[#ffb000] text-[clamp(0.6rem,2vw,10px)]">
                            {'★'.repeat(product.rating || 5)}{'☆'.repeat(5 - (product.rating || 5))}
                         </div>
                         <span className="text-[clamp(0.6rem,2vw,10px)] text-[var(--text-secondary)] font-medium whitespace-nowrap">({product.reviews || Math.floor(Math.random() * 100 + 10)})</span>
                      </div>

                      <h3 className="font-semibold text-[clamp(0.75rem,2.5vw,0.85rem)] text-[var(--text-primary)] mb-2 leading-tight group-hover:text-[var(--accent)] transition-colors break-words line-clamp-2 flex-grow flex items-center justify-center">{product.name}</h3>
                      
                      <div className="flex justify-center items-center gap-2 mb-4">
                         {product.originalPrice && <span className="text-[var(--text-secondary)] text-[clamp(0.6rem,2vw,0.75rem)] font-medium line-through opacity-70">{product.originalPrice}</span>}
                         <span className="font-bold text-[var(--accent)] text-[clamp(0.85rem,3vw,1rem)]">{product.price}</span>
                      </div>

                      <button 
                         onClick={(e) => { e.stopPropagation(); window.open(product.linktreeUrl || "#"); }}
                         className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[clamp(0.55rem,2vw,0.75rem)] font-bold px-4 py-[clamp(0.6rem,1.5vw,0.8rem)] rounded-full uppercase tracking-wider hover:bg-[var(--accent)] hover:text-white transition-colors shadow-md w-full sm:w-[90%] mx-auto block mt-auto"
                      >
                         Beli Produk
                      </button>
                   </div>
                </motion.div>
              )
           })}
        </div>
      </div>
    </section>
  )
}
