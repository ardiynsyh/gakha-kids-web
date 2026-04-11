import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Tampil setelah 2 detik
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Silakan masukkan email Anda');
      return;
    }
    
    toast.success('Terima kasih! Voucher diskon telah dikirim ke email Anda.');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--bg-primary)] rounded-[2rem] overflow-hidden shadow-2xl border border-[var(--border-color)]"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors z-10"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section */}
              <div className="hidden md:block w-1/3 bg-pink-50 relative overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop" 
                   className="w-full h-full object-cover opacity-80" 
                   alt="Newsletter" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent" />
              </div>

              {/* Content Section */}
              <div className="flex-1 p-8 md:p-10">
                <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-sm uppercase tracking-widest mb-3">
                   <Sparkles className="w-4 h-4" />
                   Eksklusif Penawaran
                </div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] leading-tight mb-4 tracking-tight">
                  Dapatkan Diskon <span className="text-[var(--accent)]">15%</span> Untuk Pesanan Pertama!
                </h2>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                  Berlangganan buletin kami dan jadilah yang pertama mengetahui koleksi terbaru serta promo menarik lainnya.
                </p>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                    <input 
                      type="email" 
                      placeholder="Alamat email Anda"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-medium text-[var(--text-primary)]"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[var(--accent)] text-white font-black py-4 rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95"
                  >
                    Klaim Potongan Sekarang
                  </button>
                  <button 
                    type="button" 
                    onClick={handleClose}
                    className="w-full text-center text-xs font-bold text-[var(--text-secondary)] border-b border-transparent hover:border-[var(--text-secondary)] py-1 transition-all uppercase tracking-tighter"
                  >
                    Tidak, Saya Ingin Harga Normal
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
