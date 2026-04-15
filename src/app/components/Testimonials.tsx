import { Link } from 'react-router';
import { motion } from 'framer-motion';

export function Testimonials() {
  return (
    <section className="py-24 bg-[#f3f7f3] font-sans min-h-[50vh] flex flex-col justify-center border-t border-white">
      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 relative">
        
        <div className="absolute top-0 right-12 text-[#1b5e20]/20 text-4xl font-light pointer-events-none">
          +
        </div>

        {/* Footer-like Grid connecting to Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 relative z-10">
           
           {/* Column 1: LATEST DROPS */}
           <div className="flex flex-col col-span-2 md:col-span-1">
              <h3 
                className="text-[#001a00] font-black text-xl mb-6 uppercase tracking-wider" 
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                LATEST DROPS
              </h3>
              <div className="w-full max-w-[220px] aspect-[4/5] bg-white rounded-sm overflow-hidden border border-[#1b5e20]/20">
                 <img 
                    src="https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=400&auto=format&fit=crop" 
                    alt="New Collection" 
                    className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105 cursor-pointer" 
                 />
              </div>
           </div>

           {/* Column 2: CLOTHING */}
           <div className="flex flex-col">
              <h3 
                className="text-[#001a00] font-black text-xl mb-6 uppercase tracking-wider" 
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                CLOTHING
              </h3>
              <ul className="space-y-3 text-sm text-[#003300]/70 font-medium tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">T-Shirts</li>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Hoodies & Sweaters</li>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Track Jackets</li>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Pants</li>
              </ul>
           </div>

           {/* Column 3: CULTURE */}
           <div className="flex flex-col">
              <h3 
                className="text-[#001a00] font-black text-xl mb-6 uppercase tracking-wider" 
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                CULTURE
              </h3>
              <ul className="space-y-3 text-sm text-[#003300]/70 font-medium tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Lookbook</li>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Journal</li>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Campaigns</li>
                 <li className="hover:text-[#2e7d32] hover:translate-x-2 cursor-pointer transition-all duration-300">Store</li>
              </ul>
           </div>

           {/* Column 4: SOCIALS & Button */}
           <div className="flex flex-col relative">
              <h3 
                className="text-[#001a00] font-black text-xl mb-6 uppercase tracking-wider" 
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                COMMUNITY
              </h3>
              <ul className="space-y-3 text-sm text-[#003300]/70 font-medium tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 <li className="hover:text-[#2e7d32] cursor-pointer transition-colors flex items-center gap-2">
                    <span className="text-[#2e7d32]">/</span> Instagram
                 </li>
                 <li className="hover:text-[#2e7d32] cursor-pointer transition-colors flex items-center gap-2">
                    <span className="text-[#2e7d32]">/</span> TikTok
                 </li>
                 <li className="hover:text-[#2e7d32] cursor-pointer transition-colors flex items-center gap-2">
                    <span className="text-[#2e7d32]">/</span> Twitter
                 </li>
              </ul>

              {/* Floated Primary Button */}
              <div className="absolute top-[30%] right-0 hidden md:block">
                 <motion.div whileHover="hovered" className="relative">
                    <button className="gakha-btn-primary border-none shadow-xl shadow-[#001a00]" style={{ padding: '12px 24px', fontSize: '9px' }}>
                       <span className="relative z-10 block whitespace-nowrap">Join WhatsApp Group</span>
                    </button>
                    {/* Pulsing indicator */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4caf50] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4caf50]"></span>
                    </span>
                 </motion.div>
              </div>
           </div>

        </div>

      </div>
    </section>
  );
}
