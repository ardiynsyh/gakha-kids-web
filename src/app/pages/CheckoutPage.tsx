import { useState, useEffect, useRef } from 'react';
import { INDONESIA_CITIES } from '../../data/indonesiaCities';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard, Truck, ShieldCheck, Ticket, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { SEO } from '../components/SEO';
import { useMidtrans } from '../hooks/useMidtrans';

export function CheckoutPage() {
  const navigate = useNavigate();
  useMidtrans();

  const { cart, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'whatsapp'>('midtrans');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isFetchingShipping, setIsFetchingShipping] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    address: '',
    cityId: '',
    cityName: '',
    notes: ''
  });

  // Calculate Total Weight
  const totalWeight = cart.reduce((acc, item) => acc + ( (item as any).weight || 200 ) * item.quantity, 0);

  // Load cities: gunakan data statis dulu, coba API di background
  const hasFetchedCities = useRef(false);
  useEffect(() => {
    if (hasFetchedCities.current) return;
    hasFetchedCities.current = true;

    // Tampilkan data statis bundled langsung (selalu berhasil)
    setCities(INDONESIA_CITIES);

    // Coba upgrade ke live API di background (jika API key sudah diset di Vercel)
    fetch('/api/shipping?type=cities')
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Upgrade ke full list dari API jika berhasil
          setCities(data);
        }
        // Jika API gagal, biarkan data statis yang tampil (sudah di-set di atas)
      })
      .catch(() => {
        // Silent fail - data statis sudah tampil
        console.warn('RajaOngkir API tidak tersedia, menggunakan data kota lokal.');
      });
  }, []);

  // ─── Flat-rate fallback per wilayah (dipakai jika RajaOngkir gagal) ──────
  const getFlatRateOptions = (cityId: string) => {
    const city = cities.find(c => c.city_id === cityId);
    const pid = city?.province_id || '9';

    const JAVA   = ['6','9','3','10','7','11'];
    const BALI   = ['2','22','23'];
    const SUMATRA = ['1','4','5','8','18','19','26','32','33','34'];
    const KALIMANTAN = ['13','14','15','16','36'];
    const SULAWESI   = ['27','28','29','30','31','35'];
    const PAPUA      = ['20','21','24','25'];

    let base = 25000; let etd = '4-7';
    if (pid === '6')                     { base = 12000; etd = '1-2'; } // DKI
    else if (JAVA.includes(pid))          { base = 18000; etd = '2-4'; }
    else if (BALI.includes(pid))          { base = 28000; etd = '4-7'; }
    else if (SUMATRA.includes(pid))       { base = 32000; etd = '4-7'; }
    else if (KALIMANTAN.includes(pid))    { base = 38000; etd = '5-8'; }
    else if (SULAWESI.includes(pid))      { base = 42000; etd = '5-9'; }
    else if (PAPUA.includes(pid))         { base = 55000; etd = '7-14'; }

    // Biaya tambahan tiap 500g di atas 1kg
    const extra = Math.max(0, Math.ceil((totalWeight - 1000) / 500));
    const jne  = base + extra * 3000;
    const tiki = Math.round(base * 1.1) + extra * 3000;
    const pos  = Math.round(base * 0.9) + extra * 2500;

    return [
      { service:'REG',  description:'Layanan Reguler (Estimasi)',   cost:[{value:jne,  etd, note:'*Estimasi'}], courier_name:'JNE',  courier_code:'jne',  isEstimate:true },
      { service:'REG',  description:'Layanan Reguler (Estimasi)',   cost:[{value:tiki, etd, note:'*Estimasi'}], courier_name:'TIKI', courier_code:'tiki', isEstimate:true },
      { service:'PKH',  description:'Paket Kilat Khusus (Estimasi)', cost:[{value:pos,  etd, note:'*Estimasi'}], courier_name:'POS',  courier_code:'pos',  isEstimate:true },
    ];
  };

  // Fetch Shipping Costs when City/Weight changes
  useEffect(() => {
    if (!selectedCityId || totalWeight <= 0) return;

    setIsFetchingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null);

    fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: '152', // Jakarta Pusat
        destination: selectedCityId,
        weight: totalWeight,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // RajaOngkir berhasil → pakai data live
        setShippingOptions(data);
        setSelectedShipping(data[0]);
      } else {
        // API kembali tapi tidak ada data → fallback
        const fallback = getFlatRateOptions(selectedCityId);
        setShippingOptions(fallback);
        setSelectedShipping(fallback[0]);
      }
    })
    .catch(() => {
      // API gagal total → gunakan flat-rate regional
      const fallback = getFlatRateOptions(selectedCityId);
      setShippingOptions(fallback);
      setSelectedShipping(fallback[0]);
    })
    .finally(() => setIsFetchingShipping(false));
  }, [selectedCityId, totalWeight]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('status', 'Active')
        .single();

      if (error || !data) {
        toast.error('Kupon tidak valid atau sudah kadaluarsa');
        setDiscount(0);
      } else {
        const val = data.discount_type === 'Percentage' 
          ? (subtotal * data.value) / 100 
          : data.value;
        setDiscount(val);
        toast.success(`Kupon berhasil dipasang! Potongan Rp ${val.toLocaleString()}`);
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat mengecek kupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const roundedDiscount = Math.round(discount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const orderId = Date.now();
    const shippingFee = selectedShipping?.cost?.[0]?.value || 0;
    const finalTotal = subtotal - roundedDiscount + shippingFee;

    const finalizeOrder = async (status: string) => {
      try {
        const { error: orderError } = await supabase.from('orders').insert([{
          id: orderId,
          customer_name: formData.name,
          whatsapp: formData.whatsapp,
          address: formData.address,
          city: formData.cityName,
          items: cart,
          total: finalTotal,
          status: status
        }]);

        if (orderError) throw orderError;

        // Deduct Stock
        for (const item of cart) {
          const { data: p } = await supabase.from('products').select('inventory').eq('id', item.id).single();
          if (p && p.inventory) {
            const newInv = { ...p.inventory, [item.size]: (p.inventory[item.size] || 0) - item.quantity };
            await supabase.from('products').update({ inventory: newInv }).eq('id', item.id);
          }
        }

        toast.success(status === 'Pending' ? 'Menunggu Pembayaran...' : 'Pesanan berhasil dibuat!');
        
        // ─── WhatsApp Integration ───────────────────────────────────────────
        const waNumber = '628123456789'; // Ganti dengan nomor WA Toko Anda
        const itemsList = cart.map(i => `- ${i.name} (${i.size}) x${i.quantity}`).join('%0A');
        const waMessage = `*PESANAN BARU GAKHA*%0A%0A` +
          `Order ID: #${orderId}%0A` +
          `Nama: ${formData.name}%0A` +
          `WA: ${formData.whatsapp}%0A` +
          `Alamat: ${formData.address}%0A` +
          `Kota: ${formData.cityName}%0A%0A` +
          `*Produk:*%0A${itemsList}%0A%0A` +
          `*Total:* Rp ${finalTotal.toLocaleString()}%0A` +
          `Status: ${status === 'Completed' ? 'LUNAS (Midtrans)' : 'Menunggu Bayar'}%0A%0A` +
          `_Harap segera diproses._`;
        
        const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;
        
        clearCart();
        
        // Redirect ke Tracking, tapi buka WA di tab baru jika status manual
        if (status === 'Pending') {
           window.open(waUrl, '_blank');
        }
        
        navigate('/track-order', { state: { orderId } });
      } catch (err: any) {
        console.error("Order Creation Error:", err);
        toast.error(`Gagal menyimpan pesanan: ${err.message || 'Cek koneksi database'}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    try {
      // Build item_details yang sesuai dengan gross_amount (Midtrans strict validation)
      const midtransItems = [
        // Produk dari keranjang
        ...cart.map(c => ({
          id: c.id.toString(),
          price: Math.round(c.price),
          quantity: c.quantity,
          name: c.name.substring(0, 50)
        })),
        // Ongkos kirim
        {
          id: 'SHIPPING',
          price: shippingFee,
          quantity: 1,
          name: `Ongkir ${selectedShipping?.courier_name} (${selectedShipping?.service || 'Reguler'})`
        }
      ];

      // Tambahkan baris diskon jika ada (harga negatif)
      if (roundedDiscount > 0) {
        midtransItems.push({
          id: 'DISCOUNT',
          price: -roundedDiscount,
          quantity: 1,
          name: 'Diskon Kupon'
        });
      }

      const res = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          gross_amount: finalTotal,
          customer_details: {
            first_name: formData.name,
            phone: formData.whatsapp,
            shipping_address: { address: formData.address, city: formData.cityName }
          },
          item_details: midtransItems
        })
      });

      const midtransData = await res.json();
      
      // Fallback Dev Mode / WhatsApp Flow
      if (!res.ok || !midtransData.token || paymentMethod === 'whatsapp') {
        if (paymentMethod === 'midtrans') {
          console.warn('Midtrans Error Data:', midtransData);
          toast.info('Sistem pembayaran otomatis sedang maintenance. Mengalihkan ke WhatsApp...');
        }
        await finalizeOrder('Pending');
        return;
      }

      // 2. Tampilkan Pop-up Snap Midtrans
      if (typeof window !== 'undefined' && (window as any).snap) {
        (window as any).snap.pay(midtransData.token, {
          onSuccess: async function() { 
            await finalizeOrder('Completed'); 
          },
          onPending: function() { 
            toast.info('Menunggu pembayaran... Silakan selesaikan pembayaran Anda.');
            setIsSubmitting(false);
            // Tidak menginput ke monitor data (supabase) sesuai permintaan user
          },
          onError: function() {
              toast.error('Pembayaran Gagal. Silakan coba metode lain.');
              setIsSubmitting(false);
          },
          onClose: function () {
              // Jika user tutup popup, jangan save pesanan untuk menghindari spam
              toast.error('Anda menutup pop-up pembayaran sebelum selesai.');
              setIsSubmitting(false);
          }
        });
      } else {
        // Fallback jika snap tidak ada
        await finalizeOrder('Pending');
      }
      
    } catch (e: any) {
      console.error("Network Exception:", e);
      await finalizeOrder('Pending');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-48 pb-24 px-6 max-w-lg mx-auto text-center">
         <div className="w-20 h-20 bg-[#f1f8e9] rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-8 h-8 text-[#2e7d32]" />
         </div>
         <h1 className="text-3xl font-black text-[#001a00] mb-4 uppercase tracking-tighter italic">Tas Anda Kosong</h1>
         <p className="text-gray-500 mb-10 text-sm font-medium leading-relaxed">
           Sepertinya Anda belum memilih koleksi terbaik kami untuk dibawa pulang.
         </p>
         <button 
           onClick={() => navigate('/shop/all')} 
           className="w-full bg-[#003300] text-white px-10 py-5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#2e7d32] transition-colors shadow-xl"
         >
           Mulai Belanja
         </button>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-24 px-[clamp(1rem,5vw,4rem)] max-w-7xl mx-auto font-sans">
      <SEO title="Checkout | GAKHA" />
      
      <div className="mb-16">
          <span className="text-[#2e7d32] text-[9px] font-black tracking-[0.4em] uppercase block mb-3">Selesaikan Pesanan</span>
          <h1 className="text-5xl font-black text-[#001a00] italic tracking-tighter uppercase leading-none">Checkout</h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
        {/* Left: Products & Forms */}
        <div className="lg:col-span-7 space-y-12">
           
           {/* Section: Shipping Data */}
           <div className="bg-white border-t-4 border-[#003300] p-1 shadow-sm">
              <div className="p-8 md:p-10">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-10">
                   <div className="w-8 h-8 bg-[#003300] text-white flex items-center justify-center text-xs">01</div>
                   Informasi Pengiriman
                </h2>
                <form id="order-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Nama Penerima</label>
                      <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-b-2 border-transparent focus:border-[#2e7d32] p-4 text-sm font-bold outline-none transition-colors" placeholder="Masukkan nama lengkap" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">WhatsApp (Aktif)</label>
                      <input required type="tel" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-gray-50 border-b-2 border-transparent focus:border-[#2e7d32] p-4 text-sm font-bold outline-none transition-colors" placeholder="Contoh: 0812..." />
                   </div>
                   <div className="md:col-span-2 space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Kota Tujuan</label>
                      <select 
                        required 
                        value={selectedCityId} 
                        onChange={(e) => {
                          const city = cities.find(c => c.city_id === e.target.value);
                          setSelectedCityId(e.target.value);
                          setFormData({...formData, cityId: e.target.value, cityName: city ? `${city.type} ${city.city_name}` : ''});
                        }} 
                        className="w-full bg-gray-50 border-b-2 border-transparent focus:border-[#2e7d32] p-4 text-sm font-bold outline-none cursor-pointer"
                      >
                        <option value="">-- Pilih Kota --</option>
                        {cities.map(c => (
                          <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>
                        ))}
                      </select>
                   </div>

                   {shippingOptions.length > 0 && (
                     <div className="md:col-span-2 space-y-4 bg-[#f1f8e9]/30 p-8 border border-[#2e7d32]/10 mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[9px] font-black uppercase text-[#2e7d32] tracking-[0.2em]">Pilih Kurir</label>
                          {shippingOptions[0]?.isEstimate && (
                            <span className="text-[8px] bg-[#003300] text-white px-2 py-0.5 font-bold uppercase tracking-widest">Estimasi Regional</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {shippingOptions.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedShipping(opt)}
                              className={`p-5 text-left border-2 transition-all ${selectedShipping === opt ? 'bg-white border-[#003300] shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${opt.courier_code === 'jne' ? 'text-red-600' : 'text-[#2e7d32]'}`}>
                                  {opt.courier_name}
                                </span>
                                <span className="font-bold text-[10px] text-gray-900">{opt.service}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                <p className="text-lg font-black text-[#001a00]">Rp {opt.cost?.[0]?.value?.toLocaleString() || '0'}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{opt.cost?.[0]?.etd || '-'} Hari</p>
                              </div>
                            </button>
                          ))}
                        </div>
                     </div>
                   )}

                   {isFetchingShipping && (
                     <div className="md:col-span-2 text-center py-6 text-[#2e7d32] font-black text-[10px] tracking-[0.3em] animate-pulse">
                       MENGHITUNG BIAYA PENGIRIMAN...
                     </div>
                   )}

                   <div className="md:col-span-2 space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Alamat Detail</label>
                      <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border-b-2 border-transparent focus:border-[#2e7d32] p-4 text-sm font-bold outline-none h-32 resize-none" placeholder="Jalan, No Rumah, RT/RW, Kec..." />
                   </div>
                </form>
              </div>
           </div>

           {/* Section: Products Summary */}
           <div className="bg-white border-t border-gray-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-8 p-8 md:px-0">
                 <div className="w-8 h-8 bg-gray-100 text-[#003300] flex items-center justify-center text-xs">02</div>
                 Daftar Produk
              </h2>
              <div className="divide-y divide-gray-50 border border-gray-100">
                 {cart.map((item) => (
                   <div key={`${item.id}-${item.size}`} className="p-8 flex gap-8 items-center group">
                      <div className="w-24 h-32 bg-gray-50 overflow-hidden flex-shrink-0">
                         <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                         <h3 className="font-black text-[#001a00] uppercase tracking-wider mb-2">{item.name}</h3>
                         <div className="flex gap-4 mb-4">
                           <span className="text-[9px] font-black uppercase text-[#2e7d32] tracking-widest border border-[#2e7d32]/20 px-2 py-0.5">Size: {item.size}</span>
                           <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Qty: {item.quantity}</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-1.5 border border-gray-200 hover:bg-gray-900 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                            <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-1.5 border border-gray-200 hover:bg-gray-900 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-[#001a00] mb-4 text-lg">Rp {(item.price * item.quantity).toLocaleString()}</p>
                         <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">
                            Hapus
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Summary & Checkout */}
        <div className="lg:col-span-5">
           <div className="sticky top-32 space-y-8">
              
              {/* Payment Method Selection */}
              <div className="bg-white p-8 border border-gray-100 italic">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Pilih Metode Pembayaran</p>
                <div className="space-y-3">
                   <button 
                     type="button"
                     onClick={() => setPaymentMethod('midtrans')}
                     className={`w-full p-4 flex items-center justify-between border-2 transition-all ${paymentMethod === 'midtrans' ? 'border-[#003300] bg-gray-50' : 'border-transparent bg-white gray-100'}`}
                   >
                     <div className="flex items-center gap-3">
                       <CreditCard className="w-4 h-4 text-[#2e7d32]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#001a00]">Otomatis (QRIS/Bank)</span>
                     </div>
                     <Zap className={`w-3 h-3 ${paymentMethod === 'midtrans' ? 'text-[#2e7d32]' : 'text-gray-200'}`} />
                   </button>

                   <button 
                     type="button"
                     onClick={() => setPaymentMethod('whatsapp')}
                     className={`w-full p-4 flex items-center justify-between border-2 transition-all ${paymentMethod === 'whatsapp' ? 'border-[#003300] bg-gray-50' : 'border-transparent bg-white gray-100'}`}
                   >
                     <div className="flex items-center gap-3">
                       <div className="bg-green-500 text-white p-1 rounded-sm"><ShieldCheck className="w-3 h-3" /></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#001a00]">Manual (WhatsApp)</span>
                     </div>
                   </button>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-[#003300] text-white p-10 shadow-2xl relative overflow-hidden">
                 {/* Decorative background element */}
                 <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                 
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-10 border-b border-white/10 pb-6">Ringkasan Biaya</h3>
                 
                 <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Total Produk</span>
                       <span className="font-bold">Rp {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Ongkos Kirim</span>
                       <span className="font-bold underline decoration-[#2e7d32] underline-offset-4">
                         {selectedShipping ? `+Rp ${selectedShipping.cost[0].value.toLocaleString()}` : 'Rp 0'}
                       </span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-[#81c784] bg-white/5 p-4 border-l-2 border-[#81c784]">
                        <span className="font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2"><Zap className="w-3 h-3" /> Diskon Kupon</span>
                        <span className="font-black">-Rp {discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                       <div className="space-y-2">
                          <span className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] block">Grand Total</span>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-[#81c784]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#81c784]">Secure Gateway</span>
                          </div>
                       </div>
                       <span className="text-4xl font-black tracking-tighter text-[#81c784]">
                         Rp {(subtotal + (selectedShipping?.cost?.[0]?.value || 0) - roundedDiscount).toLocaleString()}
                       </span>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   form="order-form" 
                   disabled={isSubmitting || !selectedShipping || isFetchingShipping} 
                   className="w-full bg-white text-[#003300] py-6 font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                 >
                    {isSubmitting ? 'Processing Order...' : <>Complete Transaction <ArrowRight className="w-5 h-5" /></>}
                 </button>

                 <div className="flex items-center justify-center gap-6 pt-10 border-t border-white/5 mt-10 opacity-40">
                    <CreditCard className="w-4 h-4" />
                    <Truck className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Verified Merchant</span>
                 </div>
              </div>

              {/* Promo Card */}
              <div className="bg-white p-8 border border-gray-100 flex items-center gap-6">
                 <Ticket className="w-6 h-6 text-[#2e7d32]" />
                 <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">HAVE A COUPON?</p>
                    <div className="flex gap-2">
                       <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 bg-gray-50 border-b border-gray-200 p-2 text-xs font-bold uppercase outline-none focus:border-[#2e7d32]" placeholder="CODE" />
                       <button onClick={handleApplyCoupon} disabled={isApplyingCoupon} className="text-[#2e7d32] text-[10px] font-black uppercase tracking-widest hover:underline">Apply</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
