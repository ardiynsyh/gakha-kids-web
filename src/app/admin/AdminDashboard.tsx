import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell, Camera, 
  Layout, Sparkles, Percent, Tag, RefreshCw, Printer, Calendar, TrendingUp, BarChart3, ChevronRight, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'orders' | 'coupons' | 'analytics'>('analytics');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAddingSize, setIsAddingSize] = useState<any>(null); // For Size Popup
  const [isAddingCoupon, setIsAddingCoupon] = useState(false); // For Coupon Popup
  const [config, setConfig] = useState<any>({
    announcement: { isEnabled: true, text: '🎉 GRATIS ONGKIR MINIMAL PEMBELIAN RP 500.000!' },
    flashSale: { isEnabled: false, text: 'FLASH SALE 50%', endTime: '' },
    productCategories: [
      { id: 'all', name: 'SEMUA PRODUK' },
      { id: 'born', name: 'NEW BORN' },
      { id: '0-6', name: '0-6 BULAN' },
      { id: '6-12', name: '6-12 BULAN' },
      { id: '1-5', name: '1-5 TAHUN' },
      { id: '5-12', name: '5-12 TAHUN' },
      { id: 'boys', name: 'ANAK LAKI-LAKI' },
      { id: 'girls', name: 'ANAK PEREMPUAN' },
      { id: 'baby', name: 'BAYI' },
      { id: 'toddler', name: 'TODDLER' }
    ],
    socialMedia: { instagram: '', resellerWhatsApp: '' },
    hero: { headingLine1: 'GAKHA KIDS', headingLine2: 'PREMIUM WEAR', description: 'Pakaian Bayi & Anak Terpercaya', backgroundImage: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
  };

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (pData) setProducts(pData);
      const { data: cData } = await supabase.from('store_config').select('*').eq('id', 'main').maybeSingle();
      if (cData?.config_data) setConfig({ ...config, ...cData.config_data });
      const { data: ordData } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (ordData) setOrders(ordData);
      const { data: coupData } = await supabase.from('coupons').select('*');
      if (coupData) setCoupons(coupData);
    } catch (e) { console.error(e); }
    setIsSyncing(false);
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Sinkronisasi Cloud...");
    try {
      for (const product of products) {
        await supabase.from('products').upsert(product, { onConflict: 'id' });
      }
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("Database Sinkron!", { id: tid });
    } catch (e: any) { toast.error(e.message, { id: tid }); }
    setIsLoading(false);
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Math.floor(Math.random() * 900000000) + 100000000,
      name: "Produk Baru",
      price: "Rp 150000",
      originalPrice: "",
      image: "https://images.unsplash.com/photo-1540855513560-112df639c947?auto=format&fit=crop&q=80&w=300",
      categories: ['all'],
      sizes: ["S", "M", "L", "XL"],
      inventory: { "S": 10, "M": 10, "L": 10, "XL": 10 },
      linktreeUrl: "",
    };
    setProducts([newProduct, ...products]);
  };

  const handleSendWhatsAppAWB = (order: any, awb: string) => {
    const message = `Halo ${order.customer_name}, pesanan Anda dari Gakha Kids sedang dikirim dengan nomor resi: *${awb}*. Silakan tracking secara berkala ya. Terima kasih sudah belanja!`;
    const url = `https://wa.me/${order.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Label Pengiriman - Gakha Kids</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              .label { border: 4px solid black; padding: 30px; border-radius: 20px; max-width: 500px; }
              .header { font-size: 24px; font-weight: 900; border-bottom: 2px solid #eee; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .title { font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 5px; }
              .value { font-size: 18px; font-weight: 700; }
              .items { font-size: 12px; margin-top: 20px; background: #f9f9f9; padding: 15px; border-radius: 10px; }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="header">GAKHA KIDS - SHIPPING LABEL</div>
              <div class="section">
                <div class="title">Penerima</div>
                <div class="value">${order.customer_name}</div>
                <div class="value">${order.whatsapp}</div>
              </div>
              <div class="section">
                <div class="title">Alamat Tujuan</div>
                <div class="value">${order.city}</div>
                <div class="value" style="font-size: 14px; font-weight: 400;">${order.address}</div>
              </div>
              <div class="items">
                <strong>Isi Paket:</strong><br/>
                ${order.items?.map((it: any) => `• ${it.name} (${it.size}) x${it.quantity}`).join('<br/>')}
              </div>
              <div style="margin-top: 20px; font-size: 12px; font-weight: 900;">TAGIHAN: Rp ${order.total.toLocaleString()}</div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Analytics Logic
  const dailyRecap = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((acc, o) => acc + (o.total || 0), 0);
  const monthlyRecap = orders.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth()).reduce((acc, o) => acc + (o.total || 0), 0);
  const bestSellers = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-80 bg-gray-950 text-white p-10 hidden lg:flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 mb-16">
           <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-3xl">G</div>
           <h2 className="text-2xl font-black italic tracking-tighter">Gakha<span className="text-[var(--accent)]">Admin</span></h2>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: 'analytics', label: 'Monitor', icon: <BarChart3 className="w-5 h-5" /> },
            { id: 'products', label: 'Produk', icon: <Package className="w-5 h-5" /> },
            { id: 'orders', label: 'Penjualan', icon: <ShoppingBag className="w-5 h-5" /> },
            { id: 'coupons', label: 'Kupon', icon: <Zap className="w-5 h-5" /> },
            { id: 'settings', label: 'Konfigurasi', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-xl scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} <span className="font-bold text-[12px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); navigate('/admin/login'); }} className="p-5 flex items-center gap-3 text-red-400 font-bold text-[10px] uppercase hover:bg-red-400/10 rounded-2xl">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-20 overflow-y-auto h-screen custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key="analytics">
               <div className="flex justify-between items-end mb-16">
                  <div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Status Monitor</h1>
                    <p className="text-gray-400 font-bold mt-4 uppercase text-[10px] tracking-[0.4em]">Live Store Intelligence</p>
                  </div>
                  <div className="text-right">
                     <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Today's Performance</p>
                     <div className="flex items-center gap-2 text-green-500">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-3xl font-black tracking-tighter">Rp {dailyRecap.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-[280px]">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest font-mono italic">Rekap Harian</p>
                        <h3 className="text-4xl font-black tracking-tighter">Rp {dailyRecap.toLocaleString()}</h3>
                     </div>
                     <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[70%]" /></div>
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-[280px]">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest font-mono italic">Rekap Bulanan</p>
                        <h3 className="text-4xl font-black tracking-tighter">Rp {monthlyRecap.toLocaleString()}</h3>
                     </div>
                     <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[90%]" /></div>
                  </div>
                  <div className="bg-gray-950 text-white p-10 rounded-[3.5rem] shadow-2xl col-span-2 flex flex-col justify-between h-[280px]">
                     <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">⭐ Best Performance Products</p>
                        <Zap className="text-[var(--accent)] w-6 h-6" />
                     </div>
                     <div className="flex gap-4">
                        {bestSellers.map(p => (
                          <div key={p.id} className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5">
                             <img src={p.image} className="w-12 h-12 rounded-xl object-cover mb-2" />
                             <p className="text-[10px] font-bold truncate opacity-50">{p.name}</p>
                             <p className="text-xs font-black text-[var(--accent)]">{p.sold || 0} Terjual</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
               <div className="flex justify-between items-center mb-16">
                  <h1 className="text-6xl font-black tracking-tighter uppercase italic">Inventory</h1>
                  <div className="flex gap-4">
                    <button onClick={handleAddProduct} className="bg-white border-2 border-gray-100 px-10 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-gray-50"><Plus className="w-5 h-5 text-[var(--accent)]" /> Add New</button>
                    <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-12 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                       <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} /> Sync To Cloud
                    </button>
                  </div>
               </div>

               <div className="space-y-8">
                  {products.map(p => {
                    // Logic for automatic discount badge
                    const priceNum = parseInt(p.price.replace(/[^0-9]/g, '')) || 0;
                    const origNum = parseInt(p.originalPrice?.replace(/[^0-9]/g, '') || '0');
                    const discount = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;

                    return (
                    <div key={p.id} className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-center gap-12 group hover:border-[var(--accent)]/30 transition-all">
                       <div className="relative w-40 h-40 flex-shrink-0 group/img">
                          <img src={p.image} className="w-full h-full rounded-[3rem] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                          <label className="absolute inset-0 bg-black/50 rounded-[3rem] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                             <input type="file" className="hidden" onChange={(e) => {
                               if(e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                             }} />
                             <Camera className="w-10 h-10 text-white" />
                          </label>
                          {discount > 0 && (
                            <div className="absolute -top-3 -right-3 bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-xs shadow-xl rotate-12 border-4 border-white">
                               -{discount}%
                            </div>
                          )}
                       </div>

                       <div className="flex-1 space-y-6 w-full text-center xl:text-left">
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                             <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="flex-1 font-black text-3xl outline-none bg-gray-50/50 p-4 rounded-[1.5rem] w-full border border-transparent focus:border-[var(--accent)]/20 shadow-inner" placeholder="Product Name" />
                             <div className="bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-md">
                                <Tag className="w-4 h-4 text-[var(--accent)]" />
                                <select 
                                  value={p.categories?.[0] || 'all'} 
                                  onChange={(e) => handleUpdateProduct(p.id, 'categories', [e.target.value])}
                                  className="bg-transparent text-[10px] font-black uppercase text-gray-900 outline-none cursor-pointer"
                                >
                                   {config.productCategories.map((c: any) => (
                                     <option key={c.id} value={c.id}>{c.name}</option>
                                   ))}
                                </select>
                             </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-6">
                             <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Harga Jual</label>
                                <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full bg-blue-50/50 p-4 rounded-2xl font-black text-blue-600 outline-none border border-blue-100" placeholder="Rp 150000" />
                             </div>
                             <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Harga Coret (Original)</label>
                                <input value={p.originalPrice} onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)} className="w-full bg-red-50/50 p-4 rounded-2xl font-black text-red-400 line-through outline-none border border-red-100" placeholder="Rp 200000" />
                             </div>
                          </div>
                       </div>

                       <div className="flex-shrink-0 flex flex-wrap gap-2 max-w-[450px] justify-center xl:justify-start">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-950 text-white rounded-[2rem] p-5 min-w-[85px] text-center relative group/size shadow-lg border border-white/5">
                               <button onClick={() => {
                                  const ns = p.sizes.filter((sz: string) => sz !== s);
                                  const ni = { ...p.inventory }; delete ni[s];
                                  handleUpdateProduct(p.id, 'sizes', ns);
                                  handleUpdateProduct(p.id, 'inventory', ni);
                               }} className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover/size:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                               <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                 const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                 handleUpdateProduct(p.id, 'inventory', inv);
                               }} className="w-full bg-transparent text-center font-black text-base outline-none text-[var(--accent)]" />
                            </div>
                          ))}
                          <button onClick={() => setIsAddingSize(p.id)} className="w-16 h-[100px] border-4 border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center text-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all bg-gray-50/50"><Plus className="w-8 h-8" /></button>
                       </div>
                       <div className="flex xl:flex-col gap-4">
                          <button onClick={() => { if(confirm('Hapus?')) { supabase.from('products').delete().eq('id', p.id).then(() => fetchData()); } }} className="p-6 bg-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-90"><Trash className="w-6 h-6" /></button>
                       </div>
                    </div>
                  )})}
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders">
               <h1 className="text-6xl font-black mb-16 tracking-tighter uppercase italic">Sales Registry ({orders.length})</h1>
               <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-[0.4em] text-gray-400">
                        <tr><th className="p-12">Registry ID</th><th className="p-12">Identity</th><th className="p-12">Net Value</th><th className="p-12">Status</th><th className="p-12">Logistics</th><th className="p-12"></th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 group transition-all">
                             <td className="p-12 font-mono font-black text-blue-600 tracking-tighter">#{o.id.toString().slice(-8)}</td>
                             <td className="p-12 font-black text-gray-950">{o.customer_name}</td>
                             <td className="p-12 font-black text-xl">Rp {o.total.toLocaleString()}</td>
                             <td className="p-12"><span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{o.status}</span></td>
                             <td className="p-12 font-bold text-gray-400 text-xs">{o.tracking_number || '-'}</td>
                             <td className="p-12 text-right"><button onClick={() => setSelectedOrder(o)} className="bg-gray-950 text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl active:scale-95"><Eye className="w-5 h-5 text-[var(--accent)]" /> Manage</button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'coupons' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="coupons">
               <div className="flex justify-between items-center mb-16">
                  <h1 className="text-6xl font-black tracking-tighter uppercase italic">Voucher Engine</h1>
                  <button onClick={() => setIsAddingCoupon(true)} className="bg-gray-950 text-white px-12 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"><Plus className="w-6 h-6 text-[var(--accent)]" /> Add New Voucher</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {coupons.map(c => {
                    const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                    if (isExpired) return null; // Logic 2: Auto-hide when expired
                    return (
                    <div key={c.id} className="relative bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group">
                       <div className="absolute top-8 right-8 bg-gray-50 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400">{c.expiry_date || 'NO EXPIRY'}</div>
                       <div className="bg-gray-950 text-[var(--accent)] px-10 py-4 rounded-[2rem] font-mono font-black text-3xl mb-6 shadow-2xl tracking-tighter group-hover:scale-110 transition-transform">{c.code}</div>
                       <p className="text-4xl font-black mb-2 leading-none">{c.value}% <span className="text-xs uppercase text-gray-400 tracking-widest">OFF</span></p>
                       <button onClick={async () => { await supabase.from('coupons').delete().eq('id', c.id); fetchData(); }} className="mt-8 text-red-500 font-black text-[10px] uppercase underline hover:text-red-700">Delete Permanently</button>
                    </div>
                  )})}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="max-w-4xl space-y-10 pb-40">
               <div className="bg-gray-950 text-white p-16 rounded-[4.5rem] shadow-2xl flex justify-between items-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Store Identity</h1>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em] mt-4 italic">Management Terminal</p>
                  </div>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-12 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10">Save Global Changes</button>
                  <Settings className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Hero Settings */}
                  <div className="bg-white p-12 rounded-[4rem] border border-gray-100 space-y-8 shadow-sm">
                     <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
                        <p className="text-[12px] font-black text-gray-950 uppercase tracking-widest italic">Display Hero</p>
                     </div>
                     <div className="space-y-4">
                        <input value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50/50 p-5 rounded-2xl outline-none font-black text-xl border border-transparent focus:border-gray-200" placeholder="Main Heading" />
                        <input value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-pink-50/50 p-5 rounded-2xl outline-none font-black text-xl text-[var(--accent)] border border-transparent focus:border-pink-100" placeholder="Accent Heading" />
                     </div>
                  </div>
                  {/* Social Settings */}
                  <div className="bg-white p-12 rounded-[4rem] border border-gray-100 space-y-8 shadow-sm">
                     <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        <p className="text-[12px] font-black text-gray-950 uppercase tracking-widest italic">Social & WA</p>
                     </div>
                     <div className="space-y-4">
                        <input value={config.socialMedia?.instagram} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, instagram: e.target.value}})} className="w-full bg-gray-50/50 p-5 rounded-2xl outline-none border border-transparent focus:border-gray-200 font-bold" placeholder="Instagram Link" />
                        <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, resellerWhatsApp: e.target.value}})} className="w-full bg-green-50/50 p-5 rounded-2xl outline-none border border-transparent focus:border-green-100 font-bold" placeholder="WhatsApp (628...)" />
                     </div>
                  </div>
               </div>
               {/* Announcement Settings */}
               <div className="bg-white p-12 rounded-[4.5rem] border border-gray-100 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3">
                     <Bell className="w-5 h-5 text-orange-400" />
                     <p className="text-[12px] font-black text-gray-950 uppercase tracking-widest italic">Bar Notification</p>
                  </div>
                  <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-orange-50/50 p-6 rounded-[2rem] outline-none font-black text-orange-600 border border-orange-100" placeholder="Promo Teks Pengumuman" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* POPUP: ADD SIZE */}
      <AnimatePresence>
         {isAddingSize && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-2xl">
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-16 rounded-[4.5rem] shadow-2xl w-full max-w-lg text-center relative overflow-hidden">
                  <div className="w-20 h-20 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-8"><Ruler className="w-10 h-10" /></div>
                  <h3 className="text-4xl font-black mb-8 tracking-tighter uppercase italic leading-none">New Category Size</h3>
                  <input id="newSizeInput" className="w-full bg-gray-50 p-6 rounded-3xl outline-none font-black text-3xl text-center mb-10 border-2 border-transparent focus:border-[var(--accent)]/30" placeholder="EX: XXL / 4Y" autoFocus />
                  <div className="flex gap-4">
                     <button onClick={() => setIsAddingSize(null)} className="flex-1 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-gray-400">Cancel</button>
                     <button onClick={() => {
                        const val = (document.getElementById('newSizeInput') as HTMLInputElement).value;
                        if(val) {
                          setProducts(prev => prev.map(p => p.id === isAddingSize ? { ...p, sizes: [...(p.sizes||[]), val.toUpperCase()], inventory: { ...(p.inventory||{}), [val.toUpperCase()]: 0 } } : p));
                          setIsAddingSize(null);
                          toast.success(`Size ${val} ditambahkan!`);
                        }
                     }} className="flex-1 bg-gray-950 text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95">Add Size</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* POPUP: CREATE COUPON */}
      <AnimatePresence>
         {isAddingCoupon && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-2xl">
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-16 rounded-[4.5rem] shadow-2xl w-full max-w-2xl relative overflow-hidden">
                  <h3 className="text-4xl font-black mb-12 tracking-tighter uppercase italic leading-none text-center">Engineered Voucher</h3>
                  <div className="space-y-6 mb-12">
                     <div><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Unique Code</label>
                     <input id="cCode" className="w-full bg-gray-50 p-5 rounded-2xl font-black text-2xl uppercase tracking-widest outline-none border border-transparent focus:border-gray-200" placeholder="GAKHA50" /></div>
                     <div className="flex gap-6">
                        <div className="flex-1"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Discount (%)</label>
                        <input id="cVal" type="number" className="w-full bg-gray-50 p-5 rounded-2xl font-black text-2xl outline-none" placeholder="50" /></div>
                        <div className="flex-1"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Expiry Date</label>
                        <input id="cExp" type="date" className="w-full bg-gray-50 p-5 rounded-2xl font-bold text-sm outline-none" /></div>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setIsAddingCoupon(false)} className="flex-1 py-6 rounded-[2rem] font-black uppercase text-xs text-gray-400">Abort</button>
                     <button onClick={async () => {
                        const code = (document.getElementById('cCode') as HTMLInputElement).value;
                        const val = (document.getElementById('cVal') as HTMLInputElement).value;
                        const exp = (document.getElementById('cExp') as HTMLInputElement).value;
                        if(code && val) {
                           await supabase.from('coupons').insert([{ id: Date.now(), code: code.toUpperCase(), value: parseInt(val), expiry_date: exp || null, status: 'Active' }]);
                           setIsAddingCoupon(false);
                           fetchData();
                           toast.success("Voucher Created!");
                        }
                     }} className="flex-1 bg-[var(--accent)] text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl">Initialize Voucher</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* POPUP: ORDER DETAIL (REFINED V2) */}
      <AnimatePresence>
         {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-3xl">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-6xl rounded-[5rem] shadow-2xl overflow-hidden relative">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-12 right-12 p-6 bg-gray-100 rounded-[2.5rem] text-gray-400 hover:text-gray-950 transition-all z-10 hover:scale-110 active:scale-90"><X className="w-6 h-6"/></button>
                  <div className="flex flex-col lg:flex-row min-h-[750px]">
                     <div className="flex-1 p-16 lg:p-24 overflow-y-auto custom-scrollbar">
                        <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 inline-block font-mono">Invoice Registry</span>
                        <h2 className="text-7xl font-black mb-16 tracking-tighter leading-none">{selectedOrder.customer_name}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                           <div className="p-10 bg-gray-50 rounded-[4rem] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl">
                              <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest italic">Shipping Address</p>
                              <div className="flex items-start gap-5">
                                 <div className="w-16 h-16 bg-white rounded-3xl shadow-md flex items-center justify-center flex-shrink-0"><MapPin className="w-7 h-7 text-blue-600" /></div>
                                 <div><p className="font-black text-xl mb-2">{selectedOrder.city}</p><p className="text-sm font-medium text-gray-400 leading-relaxed">{selectedOrder.address}</p></div>
                              </div>
                           </div>
                           <div className="p-10 bg-gray-50 rounded-[4rem] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl">
                              <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest italic">Channel Access</p>
                              <div className="flex items-start gap-5">
                                 <div className="w-16 h-16 bg-white rounded-3xl shadow-md flex items-center justify-center flex-shrink-0"><Phone className="w-7 h-7 text-green-500" /></div>
                                 <div className="flex-1"><p className="font-black text-xl mb-4 leading-none">{selectedOrder.whatsapp}</p><a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="bg-green-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-green-200"><MessageSquare className="w-4 h-4" /> Open WhatsApp</a></div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-6">Logistics Configuration</p>
                           <div className="flex gap-4">
                              <input 
                                id="awbInput" 
                                value={selectedOrder.tracking_number} 
                                onChange={(e) => setSelectedOrder({...selectedOrder, tracking_number: e.target.value})}
                                className="flex-1 bg-gray-50 p-6 rounded-[2rem] outline-none font-black text-xl border border-transparent focus:border-blue-100 shadow-inner" placeholder="INPUT NOMOR RESI (AWB)" />
                              <button onClick={() => {
                                 const awb = (document.getElementById('awbInput') as HTMLInputElement).value;
                                 if(awb) {
                                    supabase.from('orders').update({ tracking_number: awb, status: 'Shipped' }).eq('id', selectedOrder.id).then(() => {
                                       toast.success("AWB Saved! Sending WA...");
                                       handleUpdateOrderStatus(selectedOrder.id, 'Shipped');
                                       handleSendWhatsAppAWB(selectedOrder, awb);
                                    });
                                 }
                              }} className="bg-blue-600 text-white px-10 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all active:scale-95">Save AWB & Notify WA</button>
                           </div>
                        </div>
                     </div>

                     <div className="w-full lg:w-[500px] bg-gray-950 text-white p-16 lg:p-24 flex flex-col relative overflow-hidden">
                        <div className="relative z-10 flex-1 flex flex-col">
                           <div className="flex justify-between items-center mb-16">
                              <h4 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] italic">Bundle Overview</h4>
                              <button onClick={() => handlePrintInvoice(selectedOrder)} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-[var(--accent)]"><Printer className="w-6 h-6" /></button>
                           </div>
                           <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar mb-16">
                              {selectedOrder.items?.map((it: any, i: number) => (
                                <div key={i} className="flex gap-8 items-center group">
                                   <div className="w-20 h-20 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group-hover:scale-110 transition-transform"><img src={it.image} className="w-full h-full object-cover" /></div>
                                   <div className="flex-1"><p className="text-md font-black italic truncate leading-none mb-3">{it.name}</p><div className="flex items-center gap-3"><span className="text-[10px] font-black uppercase text-gray-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{it.size}</span><span className="text-[10px] font-black uppercase text-[var(--accent)]">QTY: {it.quantity}</span></div></div>
                                </div>
                              ))}
                           </div>
                           <div className="pt-16 border-t border-white/10">
                              <div className="flex justify-between items-end mb-12">
                                 <span className="text-[11px] font-black uppercase text-gray-500 italic tracking-[0.3em]">Net Balance</span>
                                 <span className="text-5xl font-black text-[var(--accent)] tracking-tighter leading-none">Rp {selectedOrder.total.toLocaleString()}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <button onClick={() => handlePrintInvoice(selectedOrder)} className="bg-white/5 border border-white/10 py-7 rounded-[2.5rem] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">Invoice Label</button>
                                 <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Completed')} className="bg-[var(--accent)] text-white py-7 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Selesaikan Pesanan</button>
                              </div>
                           </div>
                        </div>
                        <ShoppingBag className="absolute -bottom-20 -right-20 w-80 h-80 opacity-5 -rotate-12" />
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .lg\\:flex-col-custom { display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}

const Ruler = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3l-5-5L15 9l-2.2 2.2L11 9.4 8.8 11.6l-1.8-1.8-3.6 3.6c-.4.4-.4 1 0 1.4s1 .4 1.4 0l2.2-2.2L8.8 14.4l2.2-2.2 1.8 1.8 2.2-2.2L16.4 13.2 20.6 17.4c.4.4 1 .4 1.4 0s.4-1-.1-1.4z"/><path d="M2 12V3h9v9"/><path d="M7 3v4M3 7h4"/>
  </svg>
);
