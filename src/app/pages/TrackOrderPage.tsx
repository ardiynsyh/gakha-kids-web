import { useState, useEffect } from 'react';
import { Truck, Search, ExternalLink, Package, ShieldCheck, MapPin, AlertCircle, X } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

export function TrackOrderPage() {
  const [resi, setResi] = useState('');
  const [courier, setCourier] = useState('auto');
  const location = useLocation();

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  useEffect(() => {
    if (location.state?.orderId) {
       setRefundOrderId(location.state.orderId.toString());
    }
  }, [location.state]);

  const couriers = [
    { id: 'auto', name: 'Deteksi Otomatis' },
    { id: 'jne', name: 'JNE (Jalur Nugraha Ekakurir)' },
    { id: 'jnt', name: 'J&T Express' },
    { id: 'sicepat', name: 'SiCepat' },
    { id: 'tiki', name: 'TIKI' },
    { id: 'anteraja', name: 'AnterAja' },
    { id: 'pos', name: 'POS Indonesia' },
    { id: 'wahana', name: 'Wahana' },
    { id: 'ninja', name: 'Ninja Xpress' }
  ];

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resi.trim()) return;
    const url = `https://cekresi.com/?noresi=${resi}`;
    window.open(url, '_blank');
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId.trim() || !refundReason.trim()) return;
    setIsSubmittingRefund(true);
    
    try {
      const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', refundOrderId).single();
      
      if (!order || fetchErr) {
        toast.error('Pesanan tidak ditemukan. Cek kembali No Pesanan Anda.');
        setIsSubmittingRefund(false);
        return;
      }
      
      if (order.status === 'Refund Requested' || order.status === 'Refunded' || order.status === 'Cancelled') {
        toast.error('Status pesanan ini tidak dapat diajukan pengembalian (Sudah diajukan/Dibatalkan).');
        setIsSubmittingRefund(false);
        return;
      }

      const newNotes = (order.notes || '') + `\n\n[ADMIN_NOTE: Pengajuan Refund] Alasan: ${refundReason}`;
      
      const { error: updateErr } = await supabase.from('orders').update({
        status: 'Refund Requested',
        notes: newNotes
      }).eq('id', refundOrderId);

      if (updateErr) throw updateErr;

      toast.success('Pengajuan pengembalian dana berhasil dikirim!');
      setRefundOrderId('');
      setRefundReason('');
      setIsRefundModalOpen(false);
    } catch (err) {
      toast.error('Terjadi kesalahan sistem. Coba lagi nanti.');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] py-20 min-h-[70vh]">
      <SEO 
        title="Lacak Pesanan & Bantuan" 
        description="Pantau status pengiriman paket dan ajukan bantuan/pengembalian dana GAKHA secara real-time." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Illustration & Text */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-black uppercase tracking-[0.2em]">
            <Truck className="w-4 h-4" /> Real-time tracking
          </div>
          
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-[var(--text-primary)] leading-[0.9] tracking-tighter">
            Dimana <span className="text-[var(--accent)] italic">Paketmu</span> Sekarang?
          </h1>
          
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Paket GAKHA Anda sedang dalam perjalanan! Masukkan nomor resi yang Anda terima untuk memantau status pengiriman secara langsung.
          </p>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <ShieldCheck className="w-8 h-8 text-[var(--accent)] mb-4" />
                <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">Terjamin Aman</h4>
                <p className="text-[10px] text-[var(--text-secondary)]">Setiap paket dipacking dengan bubble wrap tebal.</p>
             </div>
             <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <MapPin className="w-8 h-8 text-blue-500 mb-4" />
                <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">Pengiriman Cepat</h4>
                <p className="text-[10px] text-[var(--text-secondary)]">Dikirim setiap hari dari gudang pusat kami.</p>
             </div>
          </div>
        </div>

        {/* Right Side: Tracking Form */}
        <div className="bg-[var(--bg-primary)] p-8 sm:p-12 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden">
           {/* Decorative background element */}
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
           
           <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Package className="w-6 h-6 text-[var(--accent)]" /> 
              Informasi Pengiriman
           </h3>

           <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Pilih Kurir</label>
                 <select 
                   value={courier}
                   onChange={(e) => setCourier(e.target.value)}
                   className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all"
                 >
                    {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Nomor Resi (Waybill)</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Contoh: JNE123456789" 
                      value={resi}
                      onChange={(e) => setResi(e.target.value.toUpperCase())}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-[var(--accent)]/20 shadow-inner outline-none transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                       <Search className="w-5 h-5" />
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={!resi.trim()}
                className="w-full bg-[var(--text-primary)] hover:bg-[var(--accent)] text-[var(--bg-primary)] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
              >
                 Lacak Sekarang <ExternalLink className="w-4 h-4" />
              </button>

              <div className="pt-6 border-t border-[var(--border-color)] mt-6">
                 <p className="text-[10px] text-center text-[var(--text-secondary)] leading-relaxed">
                    *Layanan pelacakan disediakan oleh aggregator pihak ketiga. Jika resi tidak ditemukan, pastikan Anda telah menunggu 1x24 jam sejak pengiriman.
                 </p>
              </div>
           </form>
        </div>
      </div>

      {/* FAQs or Support Section */}
      <div className="mt-32 pt-16 border-t border-[var(--border-color)]">
         <div className="text-center max-w-2xl mx-auto mb-16 relative">
            <h2 className="text-3xl font-black mb-4">Butuh Bantuan?</h2>
            <p className="text-[var(--text-secondary)] mb-8">Tim Customer Service kami siap membantu jika Anda mengalami kendala pengiriman atau memiliki keluhan terhadap pesanan.</p>
            
            <button 
              onClick={() => setIsRefundModalOpen(true)}
              className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
            >
              <AlertCircle className="w-4 h-4" /> Ajukan Pengembalian Dana
            </button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { q: "Kapan pesanan dikirim?", a: "Semua pesanan diproses dalam 1-2 hari kerja setelah verifikasi pembayaran." },
              { q: "Resi tidak terbaca?", a: "Biasanya data resi masuk ke sistem kurir 12 jam setelah paket di-pickup." },
              { q: "Syarat klaim refund?", a: "Wajib menyertakan video unboxing 360 derajat tanpa jeda (no-cut) saat paket pertama kali dibuka maksimal 1x24 jam setelah paket diterima." }
            ].map((faq, idx) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border-color)] hover:shadow-xl transition-all duration-500">
                 <h4 className="font-bold mb-4 text-[var(--text-primary)]">{faq.q}</h4>
                 <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Refund Modal */}
      <AnimatePresence>
        {isRefundModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsRefundModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-primary)] w-full max-w-lg rounded-[2rem] p-8 sm:p-10 relative z-10 shadow-2xl border border-[var(--border-color)]"
            >
              <button 
                onClick={() => setIsRefundModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-red-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2">Pusat Resolusi</h3>
                <p className="text-sm text-[var(--text-secondary)]">Ajukan pengembalian barang atau dana (Refund) untuk pesanan Anda.</p>
              </div>

              <form onSubmit={handleRefundSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)] ml-1">Nomor Pesanan (Order ID)</label>
                  <input
                    type="text"
                    required
                    value={refundOrderId}
                    onChange={(e) => setRefundOrderId(e.target.value)}
                    placeholder="Contoh: 17130838183"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-red-500/20 font-bold"
                  />
                  <p className="text-[9px] text-[var(--text-secondary)] ml-1">Lihat di Email / Bukti Pembayaran Anda.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)] ml-1">Alasan Pengembalian</label>
                  <textarea
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Jelaskan alasan pengembalian (Cacat, Salah Ukuran, dll). Jangan lupa siapkan video unboxing untuk kami minta via WhatsApp."
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-red-500/20 min-h-[120px] resize-y"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingRefund ? 'Memproses...' : 'Kirim Pengajuan'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
