import { motion } from 'framer-motion';
import { CheckCircle, Zap, ShieldCheck, DollarSign, Package, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function ResellerProgram() {
  const { config } = useStore();
  const resellerNumber = config?.socialMedia?.resellerWhatsApp || "628123456789";
  
  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: "Profit Tinggi",
      description: "Nikmati margin keuntungan hingga 30-40% dari setiap produk yang terjual."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
      title: "Kualitas Premium",
      description: "Produk GAKHA menggunakan bahan pilihan yang awet dan nyaman untuk penggunaan sehari-hari."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Marketing Kit",
      description: "Kami sediakan foto & video katalog profesional untuk memudahkan promosi Anda."
    },
    {
      icon: <Package className="w-8 h-8 text-purple-500" />,
      title: "Tanpa Stok (Dropship)",
      description: "Bisa mulai tanpa stok barang. Kami yang kirim produk ke pelanggan Anda."
    },
    {
      icon: <Users className="w-8 h-8 text-[var(--accent)]" />,
      title: "Bimbingan Bisnis",
      description: "Grup eksklusif untuk tips jualan dan strategi marketing terkini."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      title: "Mudah & Cepat",
      description: "Proses pendaftaran cepat dan langsung bisa jualan setelah disetujui."
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-[var(--text-primary)] leading-tight"
        >
          Tumbuh Bersama <span className="text-[var(--accent)]">GAKHA</span>
        </motion.h2>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
          Bergabunglah dengan program kemitraan kami dan mulai bisnis fashion stadion Anda sendiri dengan merk yang sudah dipercaya pecinta sepak bola di Indonesia.
        </p>
      </section>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {benefits.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex items-start gap-4 group hover:border-[var(--accent)]/50 hover:shadow-xl transition-all"
          >
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="bg-[var(--text-primary)] text-[var(--bg-primary)] p-10 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden"
      >
        {/* Abstract 3D shape bg */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4">Siap Memulai Bisnis Anda?</h3>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Klik tombol di bawah ini untuk mendaftar via WhatsApp. Tim kami akan menghubungi Anda dalam 1x24 jam.
          </p>
          <a 
            href={`https://wa.me/${resellerNumber}?text=Halo%20GAKHA,%20saya%20tertarik%20bergabung%20menjadi%20reseller`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[var(--accent)] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
          >
            Daftar Sekarang <span className="text-2xl">📱</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
