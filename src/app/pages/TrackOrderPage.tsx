import { useState } from 'react';
import { Truck, Search, ExternalLink, Package, ShieldCheck, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';

export function TrackOrderPage() {
  const [resi, setResi] = useState('');
  const [courier, setCourier] = useState('auto');

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
    
    // Redirecting to cekresi.com for a free integrated experience
    // This is the most cost-effective way for a store without a heavy backend
    const url = `https://cekresi.com/?noresi=${resi}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] py-20 min-h-[70vh]">
      <SEO 
        title="Lacak Pesanan" 
        description="Pantau status pengiriman paket Gakha Kids Anda secara real-time. Cukup masukkan nomor resi dan pilih kurir untuk melacak pesanan Anda." 
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
            Paket Gakha Kids Anda sedang dalam perjalanan! Masukkan nomor resi yang Anda terima untuk memantau status pengiriman secara langsung.
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
        <div className="bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden">
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
                className="w-full bg-[var(--text-primary)] hover:bg-[var(--accent)] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
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
         <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black mb-4">Butuh Bantuan?</h2>
            <p className="text-[var(--text-secondary)]">Tim Customer Service kami siap membantu jika Anda mengalami kendala pengiriman.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { q: "Kapan pesanan dikirim?", a: "Semua pesanan diproses dalam 1-2 hari kerja setelah verifikasi pembayaran." },
              { q: "Resi tidak terbaca?", a: "Biasanya data resi masuk ke sistem kurir 12 jam setelah paket di-pickup." },
              { q: "Cara klaim garansi?", a: "Sertakan video unboxing saat paket pertama kali dibuka ke admin WA kami." }
            ].map((faq, idx) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-[var(--bg-secondary)] hover:bg-white border border-transparent hover:border-[var(--border-color)] hover:shadow-xl transition-all duration-500">
                 <h4 className="font-bold mb-4 text-[var(--text-primary)]">{faq.q}</h4>
                 <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
