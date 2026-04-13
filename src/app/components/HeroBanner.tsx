import { Link } from 'react-router';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { storeConfig } from '../../data/storeConfig';

export function HeroBanner() {
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Setup Parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const planetY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const modelY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <div 
      className="w-full px-[clamp(1rem,5vw,4rem)] max-w-[1800px] mx-auto pt-1 sm:pt-6 pb-6 font-sans perspective-1000" 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full rounded-[clamp(1.5rem,4vw,2.5rem)] bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] h-[clamp(450px,70vh,700px)] overflow-hidden flex items-center shadow-2xl transition-all duration-200 ease-out"
      >
        
        {/* Interactive Mesh Gradient inside Hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 rotate: [0, 90, 0],
                 x: [-20, 20, -20]
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#fb246a]/20 blur-[100px] rounded-full"
            />
            <motion.div 
               animate={{ 
                 scale: [1.2, 1, 1.2],
                 rotate: [90, 0, 90],
                 x: [20, -20, 20]
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#3e6b8c]/40 blur-[120px] rounded-full"
            />
        </div>

        {/* Parallax Background Cover */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] bg-gradient-to-r from-[#3e6b8c] to-[#4b80a6] -z-10 mix-blend-overlay opacity-60"></motion.div>

        {/* 3D Floating Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Dynamic Interactive Shapes */}
            <motion.div 
               animate={{ 
                 x: [0, 20, 0], 
                 y: [0, -20, 0],
                 rotate: [0, 10, 0] 
               }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[15%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-tr from-white/20 to-transparent blur-xl"
            />
            <motion.div 
               animate={{ 
                 x: [0, -30, 0], 
                 y: [0, 15, 0],
                 rotate: [0, -15, 0] 
               }}
               transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
               className="absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full bg-gradient-to-bl from-pink-500/20 to-transparent blur-2xl"
            />
            
            {/* Parallax Stars */}
            <motion.div style={{ y: planetY }} className="absolute inset-0 opacity-90 h-[150%]">
                <div className="absolute top-[10%] left-[8%] text-yellow-300 text-2xl drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]">✨</div>
                <div className="absolute top-[35%] right-[25%] text-yellow-300 text-3xl drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] opacity-60">✨</div>
                <div className="absolute bottom-[25%] left-[30%] text-yellow-300 text-xl drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]">★</div>
                
                <div className="absolute top-[8%] left-[10%] w-24 h-24 bg-gradient-to-br from-[#fcb045] to-[#fd1d1d] rounded-full blur-[1px] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.3)] opacity-40"></div>
                <div className="absolute bottom-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] rounded-full blur-[1px] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5)] opacity-40"></div>
            </motion.div>
        </div>

        {/* Text Content */}
        <div className="relative z-20 w-full md:w-[60%] px-[clamp(1.5rem,8vw,4rem)] text-center md:text-left flex flex-col items-center md:items-start text-white" style={{ transform: "translateZ(50px)" }}>
           <motion.div style={{ y: textY }} className="relative">
              <div className="absolute inset-[-40px] bg-[#325b7a] blur-[80px] rounded-full -z-10 opacity-60 mix-blend-multiply"></div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-[clamp(2.2rem,8vw,5rem)] font-black leading-[1.1] mb-2 font-serif text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
              >
                 {storeConfig.hero.headingLine1}<br/>
                 <span className="text-[var(--accent)] drop-shadow-[0_0_10px_rgba(251,36,106,0.5)]"> {storeConfig.hero.headingLine2}</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.4 }}
                className="text-[clamp(0.9rem,2vw,1.1rem)] max-w-lg mb-8 font-medium leading-relaxed opacity-90"
              >
                {storeConfig.hero.description}
              </motion.p>
           </motion.div>
           
           <motion.div
             whileHover={{ scale: 1.05, translateZ: "20px" }}
             whileTap={{ scale: 0.95 }}
             className="relative z-30"
           >
             <Link to="/shop/all" className="bg-[var(--accent)] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(251,36,106,0.4)] block hover:bg-white hover:text-[var(--accent)] transition-all duration-300">
                {storeConfig.hero.primaryButton || 'Jelajahi Koleksi'}
             </Link>
           </motion.div>
        </div>

        {/* Model Kid (Interactive Position) */}
        <motion.div 
          style={{ y: modelY, translateZ: "100px" }} 
          className="absolute bottom-[-5%] right-[0%] w-[80%] sm:w-[55%] lg:w-[50%] h-[110%] flex items-end justify-center z-10 opacity-80 md:opacity-100 transition-opacity"
        >
           <img 
               src={storeConfig.hero.backgroundImage} 
               alt="Gakha Kids Premium Collection" 
               className="h-full w-auto object-cover object-bottom drop-shadow-[0_10px_50px_rgba(0,0,0,0.6)]"
               style={{ WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)' }}
           />
        </motion.div>
        
      </motion.div>
    </div>
  );
}
