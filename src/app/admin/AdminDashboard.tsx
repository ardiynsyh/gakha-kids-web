import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell, Camera, 
  Layout, Sparkles, Percent, Tag, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'resellers' | 'orders' | 'coupons' | 'analytics'>('analytics');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    announcement: { isEnabled: true, text: '' },
    flashSale: { isEnabled: false, text: '', endTime: '' },
    newsletterPopup: { isEnabled: false, title: '', promoCode: '', description: '' },
    productCategories: [
      { id: 'born', name: 'NEW BORN' },
      { id: '0-6', name: '0-6 BULAN' },
      { id: '6-12', name: '6-12 BULAN' },
      { id: '1-5', name: '1-5 TAHUN' },
      { id: '5-12', name: '5-12 TAHUN' }
    ],
    socialMedia: { instagram: '', resellerWhatsApp: '' },
    hero: { headingLine1: '', headingLine2: '', description: '', backgroundImage: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    checkUser();
    fetchData();

    const orderSubscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(current => [payload.new, ...current]);
        toast.info(`🔔 PESANAN BARU! Dari ${payload.new.customer_name}`, { duration: 10000 });
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(orderSubscription); };
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
      if (cData?.config_data) {
         const newConfig = { ...cData.config_data, productCategories: config.productCategories };
         setConfig(newConfig);
      }
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
    let successCount = 0;
    try {
      for (const product of products) {
        await supabase.from('products').upsert(product, { onConflict: 'id' });
        successCount++;
      }
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("Database Terupdate Sesuai Kategori Baru!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Math.floor(Math.random() * 900000000) + 100000000,
      name: "Produk Baru",
      price: "Rp 150000",
      image: "https://images.unsplash.com/photo-1540855513560-112df639c947?auto=format&fit=crop&q=80&w=300",
      categories: ['born'],
      sizes: ["S", "M", "L", "XL"],
      inventory: { "S": 10, "M": 10, "L": 10, "XL": 10 },
      linktreeUrl: "",
      seoTitle: "",
      seoDescription: ""
    };
    setProducts([newProduct, ...products]);
  };

  const handleDeleteProduct = async (id: any) => {
    if (!confirm('Hapus produk?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: any, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
       setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
       if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
       toast.success(`Pesanan ${newStatus}`);
    }
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const tid = toast.loading("Uploading...");
    try {
      const fileName = `gakha-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Gambar Berhasil Terpasang!", { id: tid });
    } catch (e: any) { toast.error(e.message, { id: tid }); }
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-950 text-white p-8 hidden md:flex flex-col flex-shrink-0">
        <h2 className="text-2xl font-black mb-12 italic">Gakha<span className="text-[var(--accent)]">Admin</span></h2>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'analytics', label: 'Monitor', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'products', label: 'Produk', icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: 'Penjualan', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'coupons', label: 'Kupon', icon: <Zap className="w-4 h-4" /> },
            { id: 'settings', label: 'Konfigurasi', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-2xl scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} <span className="font-bold text-[11px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); navigate('/admin/login'); }} className="mt-auto flex items-center gap-3 p-4 rounded-xl text-red-400 font-bold text-[10px] uppercase hover:bg-red-400/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-y-auto h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="analytics">
               <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Overview</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2 font-mono">NET REVENUE</p>
                     <h3 className="text-4xl font-black">Rp {orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}</h3>
                  </div>
                  <div className="bg-gray-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2 font-mono">TOTAL ORDERS</p>
                     <h3 className="text-4xl font-black italic">{orders.length}</h3>
                     <ShoppingBag className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
               <div className="flex justify-between items-center mb-12">
                  <h1 className="text-5xl font-black tracking-tighter uppercase">Inventory</h1>
                  <div className="flex gap-4">
                     <button onClick={handleAddProduct} className="bg-white border-2 border-gray-100 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50"><Plus className="w-5 h-5 text-[var(--accent)]" /> Buat Produk</button>
                     <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 flex items-center gap-2 transition-all">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Cloud
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-center gap-10 group hover:border-[var(--accent)]/30 transition-all">
                       <div className="relative w-32 h-32 flex-shrink-0">
                          <img src={p.image} className="w-full h-full rounded-[2.5rem] object-cover shadow-lg" />
                          <label className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                               if (e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                             }} />
                             <Camera className="w-8 h-8 text-white" />
                          </label>
                       </div>
                       
                       <div className="flex-1 space-y-4 w-full text-center md:text-left">
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                             <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="flex-1 font-black text-2xl outline-none bg-gray-50 p-3 rounded-2xl w-full" placeholder="Nama Produk" />
                             <div className="flex items-center gap-3 bg-pink-50 px-5 py-2 rounded-2xl border border-pink-100 shadow-sm relative min-w-[200px]">
                                <Tag className="w-4 h-4 text-[var(--accent)]" />
                                <select 
                                  value={p.categories?.[0] || 'all'}
                                  onChange={(e) => handleUpdateProduct(p.id, 'categories', [e.target.value])}
                                  className="bg-transparent text-[10px] font-black uppercase text-[var(--accent)] outline-none cursor-pointer appearance-none w-full pr-8"
                                >
                                   <option value="all">SEMUA KATEGORI</option>
                                   {config.productCategories.map((c: any) => (
                                     <option key={c.id} value={c.id}>{c.name}</option>
                                   ))}
                                </select>
                                <div className="absolute right-4 pointer-events-none text-[var(--accent)]">▼</div>
                             </div>
                          </div>
                          <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="font-bold text-blue-600 outline-none text-base pl-3" placeholder="Harga" />
                       </div>

                       <div className="flex flex-wrap gap-2 max-w-[420px] justify-center">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-[70px] text-center group/size relative">
                               <button onClick={() => {
                                  const newSizes = p.sizes.filter((sz: string) => sz !== s);
                                  const newInv = { ...p.inventory };
                                  delete newInv[s];
                                  handleUpdateProduct(p.id, 'sizes', newSizes);
                                  handleUpdateProduct(p.id, 'inventory', newInv);
                               }} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover/size:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                               <p className="text-[10px] font-black text-gray-400 mb-1 leading-none uppercase">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                 const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                 handleUpdateProduct(p.id, 'inventory', inv);
                               }} className="w-full bg-transparent text-center font-black text-sm outline-none" />
                            </div>
                          ))}
                          <button onClick={() => {
                             const ns = prompt("Nama Ukuran Baru:");
                             if(ns && !p.sizes.includes(ns)) {
                               setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, sizes: [...prod.sizes, ns], inventory: { ...(prod.inventory || {}), [ns]: 0 } } : prod));
                             }
                          }} className="w-12 h-[72px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"><Plus className="w-5 h-5" /></button>
                       </div>
                       <button onClick={() => handleDeleteProduct(p.id)} className="p-5 text-red-100 hover:text-red-500 transition-all"><Trash className="w-7 h-7" /></button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders">
               <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Sales Registry</h1>
               <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">
                        <tr><th className="p-10">Order ID</th><th className="p-10">Customer</th><th className="p-10">Total</th><th className="p-10">Status</th><th className="p-10"></th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 group transition-all">
                             <td className="p-10 font-mono font-bold text-blue-600 tracking-tighter">#{o.id.toString().slice(-6)}</td>
                             <td className="p-10 font-black text-gray-900">{o.customer_name}</td>
                             <td className="p-10 font-black text-lg">Rp {o.total.toLocaleString()}</td>
                             <td className="p-10"><span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{o.status}</span></td>
                             <td className="p-10 text-right"><button onClick={() => setSelectedOrder(o)} className="bg-gray-950 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:scale-105 transition-all"><Eye className="w-4 h-4" /> Manage</button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'coupons' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="coupons">
               <div className="flex justify-between items-center mb-12">
                  <h1 className="text-5xl font-black tracking-tighter uppercase italic">Vouchers</h1>
                  <button onClick={async () => {
                    const cCode = prompt('Promo Code:');
                    if(cCode) {
                       const val = prompt('Percentage (%):');
                       await supabase.from('coupons').insert([{ id: Date.now(), code: cCode.toUpperCase(), discount_type: 'Percentage', value: parseInt(val||'10'), status: 'Active' }]);
                       fetchData();
                    }
                  }} className="bg-gray-950 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Create Coupon</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {coupons.map(c => (
                    <div key={c.id} className="bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-[var(--accent)] transition-all flex flex-col items-center text-center shadow-sm group">
                       <div className="bg-gray-900 text-[var(--accent)] px-8 py-3 rounded-2xl font-mono font-black text-2xl mb-4 group-hover:scale-110 transition-transform">{c.code}</div>
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">{c.value}% OFF</p>
                       <button onClick={async () => { await supabase.from('coupons').delete().eq('id', c.id); fetchData(); }} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase underline">Void Vouchers</button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="max-w-4xl space-y-8 pb-40">
               <div className="bg-gray-900 text-white p-12 rounded-[4rem] shadow-2xl flex justify-between items-center">
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter">Identity Config</h1>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl">Update Settings</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[4rem] border border-gray-100 space-y-6 shadow-sm">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">🖼️ Hero Display</p>
                     <input value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" placeholder="Line 1" />
                     <input value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-[var(--accent)]" placeholder="Line 2 (Accent)" />
                  </div>
                  <div className="bg-white p-10 rounded-[4rem] border border-gray-100 space-y-6 shadow-sm">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">📱 Social & WA</p>
                     <input value={config.socialMedia?.instagram} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, instagram: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" placeholder="Link Instagram" />
                     <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, resellerWhatsApp: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" placeholder="628..." />
                  </div>
               </div>

               <div className="bg-white p-12 rounded-[4rem] border border-gray-100 space-y-6 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">🏷️ LOCKED PRODUCT CATEGORIES ACTIVE</p>
                  <div className="flex flex-wrap justify-center gap-3">
                     {config.productCategories.map((c: any) => (
                       <span key={c.id} className="bg-gray-50 text-gray-900 px-8 py-3 rounded-full text-[11px] font-black border border-gray-100 shadow-sm">{c.name}</span>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL ORDER DETAIL */}
      <AnimatePresence>
         {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-xl">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-5xl rounded-[5rem] shadow-2xl overflow-hidden relative">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-12 right-12 p-5 bg-gray-100 rounded-3xl text-gray-400 hover:text-gray-900 transition-all"><X className="w-6 h-6"/></button>
                  <div className="flex flex-col lg:flex-row min-h-[600px]">
                     <div className="flex-1 p-16 lg:p-20">
                        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Order Summary</span>
                        <h2 className="text-5xl font-black mb-12 tracking-tighter leading-none">{selectedOrder.customer_name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 flex items-start gap-4 shadow-sm">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-green-500" /></div>
                              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1 leading-none">WhatsApp</p><p className="font-black text-xl leading-none">{selectedOrder.whatsapp}</p><a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="text-[var(--accent)] text-[10px] font-black uppercase mt-2 inline-block">Direct Chat</a></div>
                           </div>
                           <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 flex items-start gap-4 shadow-sm">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-blue-500" /></div>
                              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1 leading-none">Shipping</p><p className="font-black text-sm">{selectedOrder.city}</p><p className="text-[11px] font-bold text-gray-400 leading-relaxed max-w-[200px]">{selectedOrder.address}</p></div>
                           </div>
                        </div>
                     </div>
                     <div className="w-full lg:w-[450px] bg-gray-950 text-white p-16 flex flex-col">
                        <h4 className="text-[11px] font-black uppercase text-gray-500 mb-10 tracking-[0.3em]">Purchase Bundle ({selectedOrder.items?.length})</h4>
                        <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                           {selectedOrder.items?.map((it: any, i: number) => (
                             <div key={i} className="flex gap-6 items-center p-4 bg-white/5 rounded-3xl border border-white/5">
                                <img src={it.image} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" />
                                <div className="flex-1"><p className="text-sm font-black leading-tight mb-1">{it.name}</p><p className="text-[10px] font-black uppercase text-[var(--accent)]">{it.size} <span className="text-white/30 ml-2">Qty: {it.quantity}</span></p></div>
                             </div>
                           ))}
                        </div>
                        <div className="mt-12 pt-12 border-t border-white/10">
                           <div className="flex justify-between items-end mb-10"><span className="text-[11px] font-black uppercase text-gray-500">Grand Total</span><span className="text-4xl font-black text-[var(--accent)] tracking-tighter">Rp {selectedOrder.total.toLocaleString()}</span></div>
                           <div className="flex flex-col gap-3">
                              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Completed')} className="w-full bg-[var(--accent)] hover:bg-pink-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all">Selesaikan Pesanan</button>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
