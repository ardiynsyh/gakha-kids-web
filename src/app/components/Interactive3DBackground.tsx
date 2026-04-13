import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Mouse Tracking for Interactive Mesh
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth) * 100 - 50);
      mouseY.set((clientY / innerHeight) * 100 - 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax Depth
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Interactive Mesh Blobs */}
      <div className="absolute inset-0 filter blur-[120px] opacity-40 dark:opacity-30">
        
        {/* Blob 1 - Accent Pink */}
        <motion.div 
          style={{ 
            x: useTransform(springX, (v) => v * 1.5),
            y: useTransform(y1, (v) => v + (mouseY.get() * 1.2)),
            rotate 
          }}
          className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-40"
        />

        {/* Blob 2 - Soft Mint */}
        <motion.div 
          style={{ 
            x: useTransform(springX, (v) => -v * 2),
            y: useTransform(y2, (v) => v - (mouseY.get() * 1)),
            rotate: useTransform(rotate, (v) => -v)
          }}
          className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#A8E6CF] opacity-30"
        />

        {/* Blob 3 - Sky Blue */}
        <motion.div 
          style={{ 
            x: useTransform(springX, (v) => v * 0.8),
            y: useTransform(y1, (v) => v * 0.5 + 200),
          }}
          className="absolute top-[40%] left-[50%] w-[450px] h-[450px] rounded-full bg-[#B4D7F1] opacity-30"
        />
      </div>

      {/* SVG Grain/Noise Overlay for Premium Depth */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.15] mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.6" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Interactive Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
           key={i}
           style={{
             x: useTransform(springX, (v) => (v * (i % 5 + 1)) + (Math.random() * 100) + "%"),
             y: useTransform(springY, (v) => (v * (i % 3 + 1)) + (Math.random() * 100) + "%"),
           }}
           animate={{ 
             scale: [1, 1.5, 1],
             opacity: [0.1, 0.3, 0.1]
           }}
           transition={{ 
             duration: 4 + Math.random() * 4, 
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="absolute w-2 h-2 bg-[var(--accent)] rounded-full blur-[2px]"
        />
      ))}
    </div>
  );
}
