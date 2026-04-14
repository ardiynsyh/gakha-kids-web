import { useState } from 'react';
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

  // Fetch Cities on Mount
  useEffect(() => {
    fetch('/api/shipping?type=cities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCities(data);
      })
      .catch(err => console.error("Error fetching cities:", err));
  }, []);

  // Fetch Shipping Costs when City/Weight changes
  useEffect(() => {
    if (selectedCityId && totalWeight > 0) {
      setIsFetchingShipping(true);
      fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: '152', // Jakarta Pusat
          destination: selectedCityId,
          weight: totalWeight,
          courier: 'jne'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setShippingOptions(data);
          if (data.length > 0) setSelectedShipping(data[0]); 
        }
      })
      .catch(err => console.error("Error fetching shipping:", err))
      .finally(() => setIsFetchingShipping(false));
    }
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const orderId = Date.now();
    const roundedDiscount = Math.round(discount);
    const shippingFee = selectedShipping?.cost[0].value || 0;
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
        clearCart();
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
          name: `Ongkir JNE (${selectedShipping?.service || 'Reguler'})`
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
      
      // Fallback Dev Mode (Jika API Error atau env key belum di setup di Vercel)
      if (!res.ok || !midtransData.token) {
        console.warn('Midtrans Error Data:', midtransData);
        toast.error(`Sistem Pembayaran Belum Siap: ${midtransData.error || 'API Key Invalid / Localhost'}`);
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
      <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center">
         <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
         </div>
         <h1 className="text-3xl font-black text-gray-900 mb-4">Keranjang Anda Kosong</h1>
         <p className="text-gray-500 mb-8 font-medium">Sepertinya Anda belum memilih produk untuk buah hati Anda.</p>
         <button onClick={() => navigate('/shop/all')} className="bg-[var(--accent)] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
           Mulai Belanja Sekarang
         </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-[clamp(1rem,5vw,4rem)] max-w-[1400px] mx-auto font-sans">
      <SEO title="Checkout" />
      
      <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-2">Checkout</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Lengkapi data pengiriman untuk si kecil</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Products & Forms */}
        <div className="lg:w-2/3 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--accent)]" /> Ringkasan Tas Belanja
              </div>
              <div className="divide-y divide-gray-50">
                 {cart.map((item) => (
                   <div key={`${item.id}-${item.size}`} className="p-8 flex gap-6 items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                         <p className="text-[10px] font-black uppercase text-[var(--accent)] tracking-widest">Size: {item.size}</p>
                         <div className="flex items-center gap-3 mt-4 lg:hidden">
                            <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-1.5 bg-gray-50 rounded-lg"><Minus className="w-3 h-3" /></button>
                            <span className="font-bold text-sm tracking-widest">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-1.5 bg-gray-50 rounded-lg"><Plus className="w-3 h-3" /></button>
                         </div>
                      </div>
                      <div className="hidden lg:flex items-center gap-4 mr-8">
                         <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
                         <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="text-right flex flex-col items-end">
                         <p className="font-black text-gray-900 mb-3">Rp {(item.price * item.quantity).toLocaleString()}</p>
                         <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 sm:p-12">
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-8">
                 <Truck className="w-5 h-5 text-[var(--accent)]" /> Data Pengiriman
              </h2>
              <form id="order-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nama Lengkap</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[var(--accent)] p-4 rounded-2xl outline-none font-bold text-sm" placeholder="Nama Anda" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nomor WhatsApp</label>
                    <input required type="tel" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[var(--accent)] p-4 rounded-2xl outline-none font-bold text-sm" placeholder="628123..." />
                 </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Pilih Kota Tujuan</label>
                    <select 
                      required 
                      value={selectedCityId} 
                      onChange={(e) => {
                        const city = cities.find(c => c.city_id === e.target.value);
                        setSelectedCityId(e.target.value);
                        setFormData({...formData, cityId: e.target.value, cityName: city ? `${city.type} ${city.city_name}` : ''});
                      }} 
                      className="w-full bg-gray-50 border border-transparent focus:border-[var(--accent)] p-4 rounded-2xl outline-none font-bold text-sm"
                    >
                      <option value="">-- Pilih Kota --</option>
                      {cities.map(c => (
                        <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>
                      ))}
                    </select>
                  </div>

                  {shippingOptions.length > 0 && (
                    <div className="md:col-span-2 space-y-2 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                      <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest ml-1 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Pilih Layanan Pengiriman (JNE)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {shippingOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedShipping(opt)}
                            className={`p-4 rounded-2xl border transition-all text-left ${selectedShipping === opt ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-100' : 'bg-white border-transparent hover:border-blue-200'}`}
                          >
                            <p className="font-black text-xs text-gray-900 uppercase">{opt.service}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{opt.description}</p>
                            <p className="text-sm font-black text-blue-600 mt-2">Rp {opt.cost[0].value.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-400 font-medium">Estimasi: {opt.cost[0].etd} Hari</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isFetchingShipping && (
                    <div className="md:col-span-2 text-center py-4 text-blue-400 font-bold text-xs animate-pulse">
                      Menghitung Ongkos Kirim...
                    </div>
                  )}
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Alamat Lengkap</label>
                    <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[var(--accent)] p-4 rounded-2xl outline-none font-bold text-sm h-24 resize-none" placeholder="Alamat detail..." />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Catatan Tambahan (Opsional)</label>
                    <input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[var(--accent)] p-4 rounded-2xl outline-none font-bold text-sm" placeholder="Catatan..." />
                 </div>
              </form>
           </div>
        </div>

        {/* Right: Summary & Checkout */}
        <div className="lg:w-1/3">
           <div className="sticky top-32 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-[10px] font-black uppercase tracking-widest">
                 <Ticket className="w-4 h-4 text-blue-500 mb-4 inline mr-2" /> Punya Kode Kupon?
                 <div className="flex gap-2 mt-2">
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 bg-gray-50 border border-transparent focus:border-blue-300 p-3 rounded-xl outline-none font-bold text-xs uppercase" placeholder="KODE" />
                    <button onClick={handleApplyCoupon} disabled={isApplyingCoupon} className="bg-gray-900 text-white px-5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600">Cek</button>
                 </div>
              </div>

              <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-gray-100 shadow-xl">
                 <h3 className="text-xl font-black text-gray-900 italic tracking-tight uppercase mb-8">Ringkasan Biaya</h3>
                 <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal Produk</span>
                       <span className="font-bold text-gray-900">Rp {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Ongkos Kirim JNE ({totalWeight}g)</span>
                       <span className="font-bold text-gray-900">+Rp {selectedShipping ? selectedShipping.cost[0].value.toLocaleString() : '0'}</span>
                    </div>
                    {discount > 0 && (
                      <>
                        <div className="flex justify-between text-[11px] pt-3 border-t border-gray-50">
                           <span className="text-gray-400 font-bold uppercase tracking-widest">Total Sebelum Diskon</span>
                           <span className="text-gray-400 line-through">Rp {(subtotal + (selectedShipping?.cost[0].value || 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600 bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                          <span className="font-black uppercase tracking-widest text-[10px] flex items-center gap-1"><Zap className="w-3 h-3" /> Potongan Kupon</span>
                          <span className="font-black">-Rp {discount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="pt-6 border-t-2 border-dashed border-gray-100 mt-6 flex justify-between items-end">
                       <div className="space-y-1">
                          <span className="text-gray-900 font-bold uppercase tracking-tight text-[10px] block opacity-50">Total Pembayaran</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black italic">Midtrans Secure</span>
                       </div>
                       <span className="text-3xl font-black text-[var(--accent)] tracking-tighter">Rp {(subtotal + (selectedShipping?.cost[0].value || 0) - roundedDiscount).toLocaleString()}</span>
                    </div>
                 </div>
                 <button type="submit" form="order-form" disabled={isSubmitting} className="w-full bg-[var(--text-primary)] hover:bg-[var(--accent)] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50">
                    {isSubmitting ? 'Memproses...' : <>Bayar Sekarang <ArrowRight className="w-5 h-5" /></>}
                 </button>
                 <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-50 mt-6 opacity-30 text-[10px] font-black uppercase tracking-widest">
                    <CreditCard className="w-4 h-4" /> Midtrans Ready
                    <ShieldCheck className="w-4 h-4" /> Encrypted
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
