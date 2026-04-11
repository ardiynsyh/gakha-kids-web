import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function Features() {
  const features = [
    { icon: <Truck className="w-7 h-7 sm:w-10 sm:h-10 text-[var(--accent)] stroke-[1.5]" />, title: 'Pengiriman Seluruh Dunia', desc: 'Pembiayaan khusus & hadiah spesial' },
    { icon: <RotateCcw className="w-7 h-7 sm:w-10 sm:h-10 text-[var(--accent)] stroke-[1.5]" />, title: '14 Hari Pengembalian', desc: 'Kebijakan 14 hari pengembalian bebas' },
    { icon: <ShieldCheck className="w-7 h-7 sm:w-10 sm:h-10 text-[var(--accent)] stroke-[1.5]" />, title: 'Pembayaran Aman', desc: 'Kami menerima berbagai kartu utama' }
  ];

  return (
    <div className="relative bg-[var(--bg-primary)] pt-6 pb-[clamp(3rem,8vw,5rem)] font-sans">
      <div className="max-w-[1800px] mx-auto px-[clamp(1rem,5vw,4rem)] relative z-10 border-b border-[var(--border-color)] pb-[clamp(1.5rem,4vw,2.5rem)]">
         <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[clamp(1rem,3vw,2rem)] text-center divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-color)]">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start px-0 sm:px-[clamp(1rem,3vw,2rem)] pt-6 md:pt-0 gap-4 sm:gap-[clamp(1rem,2vw,1.5rem)] text-left"
              >
                 <div className="mb-2 text-[var(--accent)] flex-shrink-0 bg-[var(--accent)]/10 p-3 rounded-full hidden sm:block relative overflow-hidden group">
                    <motion.div 
                      className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-20 transition-opacity"
                    ></motion.div>
                    {feature.icon}
                 </div>
                 <div className="flex-shrink-0 sm:hidden mb-2 text-[var(--accent)]">{feature.icon}</div>
                 <div className="flex flex-col items-center sm:items-start">
                   <h3 className="text-[clamp(0.85rem,2vw,1.1rem)] font-bold text-[var(--text-primary)] mb-1 leading-tight">{feature.title}</h3>
                   <p className="text-[var(--text-secondary)] text-[clamp(0.75rem,1.5vw,0.85rem)]">{feature.desc}</p>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
      
      {/* Scroll Animated Wave divider bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[50px] sm:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <motion.path 
                 initial={{ pathLength: 0, opacity: 0 }}
                 whileInView={{ pathLength: 1, opacity: 0.25 }}
                 transition={{ duration: 2, ease: "easeOut" }}
                 d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                 fill="var(--bg-secondary)"></motion.path>
              <motion.path 
                 initial={{ pathLength: 0, opacity: 0 }}
                 whileInView={{ pathLength: 1, opacity: 0.5 }}
                 transition={{ duration: 2.5, ease: "easeOut" }}
                 d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                 fill="var(--bg-secondary)"></motion.path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="var(--bg-secondary)"></path>
          </svg>
      </div>
    </div>
  )
}
