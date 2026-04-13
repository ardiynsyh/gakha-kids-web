import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { storeConfig } from '../../data/storeConfig';

export function HeroBanner() {
  const ref = useRef(null);
  // Setup Parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Transform values for parallax effect
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const planetY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const modelY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="w-full px-[clamp(1rem,5vw,4rem)] max-w-[1800px] mx-auto py-6 font-sans" ref={ref}>
      <div className="relative w-full rounded-[clamp(1.5rem,4vw,2.5rem)] bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] h-[clamp(450px,70vh,800px)] overflow-hidden flex items-center shadow-2xl">
        
        {/* Parallax Background Cover */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] bg-gradient-to-r from-[#3e6b8c] to-[#4b80a6] -z-10 mix-blend-overlay opacity-60"></motion.div>

        {/* Parallax Planets & Stars */}
        <motion.div style={{ y: planetY }} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-90 h-[150%]">
            <div className="absolute top-[10%] left-[8%] text-yellow-300 text-2xl drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]">✨</div>
            <div className="absolute top-[35%] right-[25%] text-yellow-300 text-3xl drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] opacity-60">✨</div>
            <div className="absolute bottom-[25%] left-[30%] text-yellow-300 text-xl drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]">★</div>
            
            <div className="absolute top-[8%] left-[10%] w-24 h-24 bg-gradient-to-br from-[#fcb045] to-[#fd1d1d] rounded-full blur-[1px] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.3)]"></div>
            <div className="absolute bottom-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] rounded-full blur-[1px] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5)]"></div>
        </motion.div>

        {/* Text Content (Kinetic + Parallax) */}
        <div className="relative z-20 w-full md:w-[55%] px-[clamp(1.5rem,8vw,4rem)] text-center md:text-left flex flex-col items-center md:items-start text-white pt-10 md:pt-0">
           <motion.div style={{ y: textY, scale: scaleText }} className="relative transform-origin-left">
              <div className="absolute inset-[-20px] bg-[#325b7a] blur-3xl rounded-[3rem] -z-10 opacity-50 mix-blend-multiply"></div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[clamp(3rem,8vw,5.5rem)] font-black leading-[1.05] mb-2 font-serif text-white drop-shadow-2xl"
              >
                 {storeConfig.hero.headingLine1}<br/>
                 <span className="text-[var(--accent)] mix-blend-screen"> {storeConfig.hero.headingLine2}</span>
              </motion.h1>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-[clamp(1.25rem,3vw,2rem)] font-medium tracking-widest mb-8 text-white drop-shadow-md font-sans italic opacity-90 backdrop-blur-sm bg-white/5 inline-block py-2 px-4 rounded-lg border border-white/10"
              >
                 Diskon hingga 70%
              </motion.h2>
           </motion.div>
           
           <motion.div
             whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(251, 36, 106, 0.5)" }}
             whileTap={{ scale: 0.95 }}
             className="relative z-30"
           >
             <Link to="/shop/all" className="bg-[var(--accent)] text-white px-[clamp(2rem,4vw,3.5rem)] py-[clamp(0.85rem,2vw,1.15rem)] rounded-full font-bold uppercase tracking-widest text-[clamp(0.7rem,1.5vw,0.85rem)] shadow-xl block">
                Belanja Sekarang
             </Link>
           </motion.div>
        </div>

        {/* Model Kid (Mixed Media Overlap) */}
        <motion.div style={{ y: modelY }} className="absolute bottom-[-5%] right-[2%] w-[50%] lg:w-[45%] h-[105%] hidden md:flex items-end justify-center z-10">
           <img 
               src={storeConfig.hero.backgroundImage} 
               alt="Hero Banner Element" 
               className="h-full w-auto object-cover object-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] grayscale-[10%]"
               style={{ WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)' }}
           />
        </motion.div>
        
      </div>
    </div>
  )
}
