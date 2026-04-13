import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';

export function TopDeals() {
  const { config } = useStore();
  const deals = config?.topDeals || [];

  return (
    <section className="py-16 bg-[var(--bg-secondary)] px-[clamp(1rem,5vw,4rem)] font-sans">
      <div className="max-w-[1800px] mx-auto">
         
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
         >
            <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">Promo Menarik Minggu Ini</h2>
            <div className="flex justify-center mt-3 opacity-60">
               <svg width="40" height="6" viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 9.5C5 2.5 12 2.5 14.5 9.5C17 16.5 24 16.5 26.5 9.5C29 2.5 36 2.5 38.5 9.5C41 16.5 48 16.5 50.5 9.5" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
         </motion.div>

         {/* BENTO GRID LAYOUT */}
         <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-[clamp(1rem,2vw,1.5rem)] md:h-[clamp(500px,65vh,700px)]">
            {deals.map((deal: any, idx: number) => (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ delay: idx * 0.15, duration: 0.6, type: "spring" }}
                 className={`${deal.isLarge ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-1'} h-[300px] md:h-auto group`}
               >
                 <Link to={deal.route || '/shop/all'} className={`relative rounded-[2rem] overflow-hidden flex flex-col justify-end items-center pb-[clamp(1.5rem,4vw,3.5rem)] cursor-pointer ${deal.bg || 'bg-blue-100'} transition-transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] shadow-md border border-[var(--border-color)]/20 w-full h-full block`}>
                    
                    {/* Dark Mode Overlay Blending */}
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <ImageWithFallback src={deal.image} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-80 dark:opacity-90 group-hover:scale-[1.05] transition-transform duration-700 z-0" />
                    
                    <div className="relative z-20 text-center w-full px-4">
                       <h3 className="text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold text-white drop-shadow-xl mb-[clamp(0.5rem,2vw,1.2rem)] tracking-wide">{deal.title}</h3>
                       <span className="bg-white/95 backdrop-blur-md text-[#1b1b1b] text-[clamp(0.6rem,1vw,0.7rem)] font-black px-[clamp(1.2rem,3vw,1.5rem)] py-[clamp(0.6rem,1.5vw,0.85rem)] rounded-full inline-block group-hover:bg-[var(--accent)] group-hover:text-white transition-colors uppercase tracking-[0.2em] shadow-lg relative overflow-hidden hover:scale-105 transform">
                          Belanja Sekarang
                       </span>
                    </div>
                 </Link>
               </motion.div>
            ))}
         </div>

      </div>
    </section>
  )
}
