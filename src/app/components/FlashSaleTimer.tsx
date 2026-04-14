import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function FlashSaleTimer() {
  const { config } = useStore();
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    if (!config?.flashSale?.isEnabled || !config?.flashSale?.endTime) return;

    const interval = setInterval(() => {
      const end = new Date(config.flashSale.endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config?.flashSale]);

  if (!config?.flashSale?.isEnabled || !timeLeft) return null;

  return (
    <div className="bg-red-500 text-white py-2 px-4 shadow-[0_4px_20px_-5px_rgba(239,68,68,0.5)] relative overflow-hidden">
      {/* Animated Background Sparks */}
      <motion.div 
         animate={{ x: ['100%', '-100%'] }}
         transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
         className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 skew-x-[-20deg]"
      />
      
      <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 relative z-10">
        <div className="flex items-center gap-2">
           <Zap className="w-4 h-4 fill-white animate-pulse" />
           <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">{config.flashSale.text || 'GAKHA FLASH SALE'}</span>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex gap-1.5 items-baseline">
              <TimeUnit value={timeLeft.days} label="d" />
              <span className="text-[10px] font-black opacity-40">:</span>
              <TimeUnit value={timeLeft.hours} label="h" />
              <span className="text-[10px] font-black opacity-40">:</span>
              <TimeUnit value={timeLeft.minutes} label="m" />
              <span className="text-[10px] font-black opacity-40">:</span>
              <TimeUnit value={timeLeft.seconds} label="s" />
           </div>
        </div>

        <button className="hidden md:block bg-white text-red-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg">
           Dapatkan Diskon →
        </button>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
       <span className="text-sm sm:text-lg font-black tabular-nums">{value.toString().padStart(2, '0')}</span>
       <span className="text-[8px] sm:text-[10px] font-bold uppercase opacity-60 tracking-tighter">{label}</span>
    </div>
  );
}
