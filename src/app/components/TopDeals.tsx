import { motion } from 'framer-motion';
import { Link } from 'react-router';

export function TopDeals() {
  const deals = [
    { 
      title: "Matchday Tracksuit", 
      price: "Rp 549.000", 
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" 
    },
    { 
      title: "Core Hoodie", 
      price: "Rp 385.000", 
      image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=600&auto=format&fit=crop" 
    },
    { 
      title: "Tribal Scarf", 
      price: "Rp 195.000", 
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop" 
    }
  ];

  return (
    <section className="relative py-32 bg-[#ffffff] font-sans flex flex-col justify-center border-t border-[#f3f7f3] overflow-hidden">
      
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#f3f7f3_0%,#ffffff_60%)] pointer-events-none" />

      {/* Button top section */}
      <div className="w-full flex justify-center mb-16 relative z-30">
        <motion.div whileHover="hovered">
          <Link 
            to="/shop/all"
            className="gakha-btn-ghost group"
          >
            <span className="relative z-10 hidden md:inline">Lihat Semua Koleksi</span>
            <span className="relative z-10 md:hidden">Semua Koleksi</span>
            <span className="relative z-10 ml-4 group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 relative z-10 flex flex-col">
        
        {/* Massive Background Typography */}
        <div className="relative w-full text-center mb-16 md:mb-24 whitespace-nowrap overflow-visible">
           <h2 
              className="text-[clamp(6rem,22vw,22rem)] font-black text-[#f3f7f3] leading-[0.8] tracking-widest uppercase scale-y-[1.1] select-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
           >
             GAKHA
           </h2>
           {/* Dark green accent box replacing the orange one */}
           <div className="absolute right-[20%] top-[40%] bg-[#2e7d32] w-4 h-4 rounded-sm rotate-45 hidden md:block opacity-60"></div>
        </div>

        {/* 3 Model Cards overlapping text */}
        <div className="flex flex-row justify-center items-end gap-3 sm:gap-6 mt-[-15vw] md:mt-[-22vw] lg:mt-[-14vw] relative z-20">
           
           {deals.map((deal, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -20, rotate: idx % 2 === 0 ? -1 : 1 }}
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col bg-white w-[30%] max-w-[280px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_100px_-20px_rgba(0,51,0,0.15)] group cursor-pointer transition-shadow"
                onClick={() => window.location.href = '/shop/all'}
              >
                {/* Card Image */}
                <div className="w-full aspect-[3/4] bg-[#050a07] relative overflow-hidden">
                   <img 
                     src={deal.image} 
                     className="w-full h-full object-cover filter grayscale opacity-70 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[1000ms]" 
                     alt={deal.title} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#020503] via-transparent to-transparent opacity-80" />
                </div>
                
                {/* Card Bottom Box */}
                <div className="bg-white px-4 sm:px-6 py-6 sm:py-8 w-full flex flex-col text-center">
                   <span 
                     className="font-black text-[#001a00] text-sm sm:text-xl mb-1 tracking-tighter uppercase italic"
                     style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                   >
                     {deal.title}
                   </span>
                   <span className="text-[#2e7d32] text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase opacity-60">
                     {deal.price}
                   </span>
                </div>
              </motion.div>
            ))}
           
        </div>

      </div>
    </section>
  )
}
