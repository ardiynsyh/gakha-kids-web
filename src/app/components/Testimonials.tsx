import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Bunda Sarah",
    role: "Ibu dari 2 anak",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    text: "Bajunya sangat lembut dan nyaman dipakai seharian. Anak saya paling suka koleksi terbarunya karena warnanya sangat ceria dan bahannya adem!",
    rating: 5
  },
  {
    id: 2,
    name: "Mama Dina",
    role: "Pelanggan Setia",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    text: "Saksag-Go selalu jadi andalan kalau beli kado untuk keponakan. Kualitas jahitannya rapi dan sablonnya tidak mudah luntur walau dicuci berkali-kali.",
    rating: 5
  },
  {
    id: 3,
    name: "Ibu Rina",
    role: "Wiraswasta",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=150&auto=format&fit=crop",
    text: "Pengirimannya sangat cepat dan adminnya ramah banget. Sangat puas belanja di sini. Pasti akan order lagi bulan depan untuk persiapan liburan!",
    rating: 4
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="max-w-[1800px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2rem,4vw,3.5rem)] font-black text-[var(--text-primary)] font-serif italic mb-4 tracking-tighter"
          >
            Kata Mereka
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Ribuan ibu telah mempercayakan kenyamanan pakaian anak mereka kepada Saksag-Go!. Berikut adalah beberapa cerita manis dari mereka.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-[var(--bg-primary)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)] relative group hover:shadow-md transition-shadow"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[var(--accent)] opacity-10 group-hover:scale-110 transition-transform" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < t.rating ? 'fill-[#ffb000] text-[#ffb000]' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </div>

              <p className="text-[var(--text-primary)] mb-8 leading-relaxed font-medium">"{t.text}"</p>

              <div className="flex items-center gap-4 mt-auto">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">{t.name}</h4>
                  <span className="text-sm text-[var(--text-secondary)]">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
