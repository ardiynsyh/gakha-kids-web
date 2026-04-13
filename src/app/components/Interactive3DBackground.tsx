import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Create different movement values for different elements to give depth
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30 select-none">
      {/* Soft Glass Spheres */}
      <motion.div 
        style={{ y: y1, rotate }}
        className="absolute top-[20%] left-[5%] w-48 h-48 rounded-full bg-gradient-to-br from-[#A8E6CF]/20 to-transparent blur-3xl"
      />
      <motion.div 
        style={{ y: y2, rotate: -rotate }}
        className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-[#FFD1DC]/20 to-transparent blur-[80px]"
      />
      <motion.div 
        style={{ y: y3 }}
        className="absolute top-[50%] left-[40%] w-32 h-32 rounded-full bg-gradient-to-br from-[#B4D7F1]/20 to-transparent blur-2xl"
      />
      
      {/* Small Floating 'Stars' */}
      {[...Array(20)].map((_, i) => (
        <motion.div
           key={i}
           initial={{ 
             x: Math.random() * 100 + "%", 
             y: Math.random() * 100 + "%" 
           }}
           animate={{ 
             y: ["-10px", "10px", "-10px"],
             opacity: [0.2, 0.5, 0.2]
           }}
           transition={{ 
             duration: 5 + Math.random() * 5, 
             repeat: Infinity,
             delay: Math.random() * 5
           }}
           className="absolute w-1 h-1 bg-[var(--accent)] rounded-full blur-[0.5px]"
        />
      ))}
    </div>
  );
}
