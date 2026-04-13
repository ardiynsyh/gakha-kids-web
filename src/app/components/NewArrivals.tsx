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
                className="text-[clamp(1.8rem,4vw,3.2rem)] font-black text-[var(--text-primary)] font-serif italic mb-3 tracking-tighter leading-none"
              >
                Koleksi<br/>Terbaru
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed max-w-[240px]"
              >
                Pilihan **baju bayi** terbaik dengan material ramah lingkungan. Didesain khusus untuk kulit sensitif dan kenyamanan maksimal balita Anda.
              </motion.p>
              
              {/* Added Interactive List for SEO */}
              <div className="space-y-4 mb-8">
                 {[
                   { label: "Katun Organik Premium", desc: "Serat lembut anti-bakteri" },
                   { label: "Pewarna Non-Toksik", desc: "Aman jika tergigit si kecil" },
                   { label: "Jahitan Flat-Lock", desc: "Tidak gatal di kulit bayi" }
                 ].map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 + (i * 0.1) }}
                     className="border-l-4 border-[var(--accent)] pl-3 py-1"
                   >
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">{item.label}</h4>
                     <p className="text-[10px] text-[var(--text-secondary)]">{item.desc}</p>
                   </motion.div>
                 ))}
              </div>

              {/* Trending Hashtags */}
              <div className="flex flex-wrap gap-2 mb-8 max-w-[200px]">
                 {['#BajuBayi2026', '#GakhaKids', '#BahanOrganik', '#FashionBalita'].map((tag) => (
                   <span key={tag} className="text-[9px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-md">
                      {tag}
                   </span>
                 ))}
              </div>

              <Link to="/shop/new" className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-white hover:bg-[var(--accent)] transition-all px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg">
                Lihat Semua <span className="text-sm">→</span>
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
                  whileHover={{ 
                    y: -15, 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(251, 36, 106, 0.25)"
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    layout: { duration: 0.3 },
                    y: { type: "spring", stiffness: 300, damping: 20 },
                    opacity: { duration: 0.5, delay: idx * 0.1 }
                  }}
                  className="group cursor-pointer flex flex-col items-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-3 shadow-sm hover:border-[var(--accent)]/30 transition-all duration-300 relative z-0 hover:z-10"
                >
                   {/* 3D Reflection Effect on Hover */}
                   <motion.div 
                      className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl pointer-events-none transition-opacity"
                   />
                   {/* Image Box */}
                   <div className="relative w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl aspect-[4/5] mb-4 flex justify-center items-center transition-colors group-hover:bg-gray-100 overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
                      <div className={`absolute top-4 left-4 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-[4px] text-white shadow-sm z-10 ${tag.includes('%') ? 'bg-red-500' : 'bg-[#ffb000]'}`}>
                         {tag}
                      </div>
                      
                      <ImageWithFallback 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal group-hover:scale-[1.1] transition-transform duration-700 ease-out" 
                      />
                   </div>
                   
                   {/* Text Info */}
                   <div className="text-center w-full px-2">
                      <div className="flex justify-center items-center gap-1.5 mb-1.5">
                         <div className="flex text-[#ffb000] text-[clamp(0.6rem,2vw,11px)]">
                            {'★'.repeat(product.rating || 5)}{'☆'.repeat(5 - (product.rating || 5))}
                         </div>
                         <span className="text-[clamp(0.65rem,2vw,11px)] text-[var(--text-secondary)] font-medium whitespace-nowrap">({product.reviews || Math.floor(Math.random() * 100 + 10)})</span>
                      </div>

                      <h3 className="font-bold text-[clamp(0.85rem,2.5vw,1rem)] text-[var(--text-primary)] mb-1 leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">{product.name}</h3>
                      
                      <div className="flex flex-col items-center gap-0 mb-3">
                         {product.originalPrice && <span className="text-[var(--text-secondary)] text-[clamp(0.65rem,2vw,0.75rem)] font-medium line-through opacity-60 tracking-tight">{product.originalPrice}</span>}
                         <span className="font-black text-[var(--accent)] text-[clamp(1rem,3.5vw,1.2rem)]">{product.price}</span>
                      </div>

                      <button 
                         onClick={(e) => { e.stopPropagation(); window.open(product.linktreeUrl || "#"); }}
                         className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[clamp(0.55rem,2vw,0.75rem)] font-bold px-4 py-2.5 rounded-full uppercase tracking-wider hover:bg-[var(--accent)] hover:text-white transition-colors shadow-md w-full sm:w-[90%] mx-auto block mb-2"
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
