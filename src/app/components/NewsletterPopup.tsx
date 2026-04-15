import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mail, CheckCircle2, Copy } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';

export function NewsletterPopup() {
  const { config } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!config?.newsletterPopup?.isEnabled) return;
    
    // Show after 5 seconds if not closed/shown before in this session
    const hasShown = sessionStorage.getItem('gakha_newsletter_shown');
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [config?.newsletterPopup]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('gakha_newsletter_shown', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  const copyCode = () => {
    if (config?.newsletterPopup?.promoCode) {
      navigator.clipboard.writeText(config.newsletterPopup.promoCode);
      toast.success('Kode diskon berhasil disalin!');
    }
  };

  if (!config?.newsletterPopup?.isEnabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col md:flex-row min-h-[400px]"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Left side: Image/Graphic */}
            <div className="md:w-5/12 bg-gradient-to-br from-[#e8f5e9] to-white relative overflow-hidden flex items-center justify-center p-12">
               <div className="absolute top-10 left-10 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
               <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl" />
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center"
               >
                  <Sparkles className="w-48 h-48 text-[var(--accent)] opacity-[0.05]" />
               </motion.div>
               
               <div className="relative z-10 text-center">
                  <PackageIcon className="w-24 h-24 text-[var(--accent)] mx-auto mb-4 drop-shadow-xl" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Member Exclusive</p>
               </div>
            </div>

            {/* Right side: Content */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
               <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div>
                          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                             {config.newsletterPopup.title || 'Join the GAKHA Squad!'}
                          </h2>
                          <p className="text-gray-500 text-sm leading-relaxed">
                             {config.newsletterPopup.description || 'Daftar newsletter GAKHA dan dapatkan akses eksklusif ke koleksi terbaru serta promo-promo menarik setiap harinya.'}
                          </p>
                       </div>

                       <form onSubmit={handleSubmit} className="space-y-3">
                          <div className="relative">
                             <input 
                               type="email" 
                               required
                               placeholder="Alamat Email Anda"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:bg-white transition-all shadow-inner"
                             />
                             <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                          </div>
                          <button 
                            type="submit"
                            className="w-full bg-[var(--text-primary)] hover:bg-[var(--accent)] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                          >
                             Dapatkan Kode Voucher
                          </button>
                       </form>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 mb-2">Selamat Bergabung!</h3>
                          <p className="text-gray-500 text-sm">Gunakan kode voucher di bawah ini saat checkout.</p>
                       </div>
                       
                       <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 relative group">
                          <span className="text-3xl font-black tracking-widest text-[var(--accent)] font-mono">
                             {config.newsletterPopup.promoCode || 'WELCOMEGAKHA'}
                          </span>
                          <button 
                             onClick={copyCode}
                             className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                             <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                       </div>

                       <button 
                         onClick={handleClose}
                         className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-gray-900 transition-colors"
                       >
                          Lanjut Belanja
                       </button>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const PackageIcon = ({className}: {className?: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);
