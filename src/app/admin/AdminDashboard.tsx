import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell, Camera, 
  Layout, Sparkles, Percent, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'resellers' | 'orders' | 'coupons' | 'analytics'>('analytics');
  const [products, setProducts] = useState<any[]>([]);
  const [resellers, setResellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    announcement: { isEnabled: true, text: '' },
    flashSale: { isEnabled: false, text: 'FLASH SALE!', endTime: '' },
    newsletterPopup: { isEnabled: false, title: '', promoCode: '', description: '' },
    productCategories: [
      { id: 'born', name: 'New Born' },
      { id: 'baby', name: 'Baby' },
      { id: 'toddler', name: 'Toddler' }
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
      if (cData?.config_data) setConfig({ ...config, ...cData.config_data });
      const { data: ordData } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (ordData) setOrders(ordData);
      const { data: coupData } = await supabase.from('coupons').select('*');
      if (coupData) setCoupons(coupData);
      const { data: resData } = await supabase.from('resellers').select('*');
      if (resData) setResellers(resData);
    } catch (e) {
      console.error(e);
    }
    setIsSyncing(false);
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Sinkronisasi Cloud...");
    try {
      // 1. Save Products
      const { error: pError } = await supabase.from('products').upsert(products, { onConflict: 'id' });
      if (pError) throw pError;

      // 2. Save Config
      const { error: cError } = await supabase.from('store_config').upsert({ id: 'main', config_data: config }, { onConflict: 'id' });
      if (cError) throw cError;

      toast.success("Berhasil Update Seluruh Database!", { id: tid });
    } catch (e: any) {
      toast.error(`Gagal Sync: ${e.message}`, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: "Produk Baru",
      price: "Rp 150.000",
      image: "https://images.unsplash.com/photo-1519704943920-18447d21798b?auto=format&fit=crop&q=80&w=300",
      categories: ['all'],
      sizes: ["S", "M", "L", "XL"],
      inventory: { "S": 10, "M": 10, "L": 10, "XL": 10 },
      linktreeUrl: "",
      seoTitle: "",
      seoDescription: ""
    };
    setProducts([newProduct, ...products]);
    toast.success("Draf produk ditambahkan!");
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Hapus produk ini secara permanen?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      toast.success("Produk dihapus");
    }
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
    const tid = toast.loading("Mengunggah...");
    try {
      const fileName = `gakha-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Berhasil", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-white font-black text-[10px] tracking-widest uppercase opacity-50">Checking Cloud Status...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-950 text-white p-8 hidden md:flex flex-col flex-shrink-0">
        <h2 className="text-2xl font-black mb-10 italic tracking-tighter">Gakha<span className="text-[var(--accent)]">Admin</span></h2>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'analytics', label: 'Monitor', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'products', label: 'Produk', icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: 'Penjualan', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'coupons', label: 'Kupon', icon: <Zap className="w-4 h-4" /> },
            { id: 'settings', label: 'Konfigurasi', icon: <Layout className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-2xl scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} <span className="font-bold text-[11px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 rounded-xl text-red-400 font-bold text-[10px] uppercase hover:bg-red-400/10">
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
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Total Omset</p>
                     <h3 className="text-4xl font-black">Rp {orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}</h3>
                  </div>
                  <div className="bg-gray-900 text-white p-12 rounded-[3.5rem] shadow-2xl">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Order Masuk</p>
                     <h3 className="text-4xl font-black italic">{orders.length}</h3>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
               <div className="flex justify-between items-center mb-12">
                  <h1 className="text-5xl font-black tracking-tighter uppercase">Products</h1>
                  <div className="flex gap-4">
                     <button onClick={handleAddProduct} className="bg-white border-2 border-gray-100 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-2"><Plus className="w-5 h-5 text-[var(--accent)]" /> Buat Produk</button>
                     <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">🚀 Sync Cloud</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-center gap-10 group hover:border-[var(--accent)]/30 transition-all">
                       <div className="relative w-32 h-32 flex-shrink-0 group/img">
                          <img src={p.image} className="w-full h-full rounded-[2.5rem] object-cover shadow-lg" />
                          <label className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                               if (e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                             }} />
                             <Camera className="w-8 h-8 text-white" />
                          </label>
                       </div>
                       
                       <div className="flex-1 space-y-4 w-full">
                          <div className="flex flex-col md:flex-row gap-4">
                             <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="flex-1 font-black text-2xl outline-none bg-[var(--card-bg)] p-2 rounded-xl" placeholder="Nama Produk" />
                             {/* CATEGORY SELECTOR */}
                             <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">
                                <Tag className="w-3 h-3 text-[var(--accent)]" />
                                <select 
                                  value={p.categories?.[0] || 'all'}
                                  onChange={(e) => handleUpdateProduct(p.id, 'categories', [e.target.value])}
                                  className="bg-transparent text-[10px] font-black uppercase text-[var(--accent)] outline-none cursor-pointer"
                                >
                                   <option value="all">Semua Kategori</option>
                                   <option value="new">Koleksi Terbaru</option>
                                   {config.productCategories?.map((c: any) => (
                                     <option key={c.id} value={c.id.toLowerCase()}>{c.name}</option>
                                   ))}
                                </select>
                             </div>
                          </div>
                          <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full font-bold text-blue-600 outline-none text-sm" placeholder="Harga (Contoh: Rp 150.000)" />
                       </div>

                       <div className="flex flex-wrap gap-2 max-w-[400px]">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-[70px] text-center group/size relative">
                               <button onClick={() => {
                                  const newSizes = p.sizes.filter((sz: string) => sz !== s);
                                  const newInv = { ...p.inventory };
                                  delete newInv[s];
                                  handleUpdateProduct(p.id, 'sizes', newSizes);
                                  handleUpdateProduct(p.id, 'inventory', newInv);
                               }} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[9px] items-center justify-center opacity-0 group-hover/size:opacity-100 transition-opacity hidden group-hover/size:flex"><X className="w-3 h-3"/></button>
                               <p className="text-[10px] font-black text-gray-400 mb-1">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                 const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                 handleUpdateProduct(p.id, 'inventory', inv);
                               }} className="w-full bg-transparent text-center font-black text-xs outline-none" />
                            </div>
                          ))}
                          <button onClick={() => {
                             const ns = prompt("Nama Ukuran Baru:");
                             if(ns && !p.sizes.includes(ns)) {
                               setProducts(prev => prev.map(prod => prod.id === p.id ? {
                                  ...prod,
                                  sizes: [...prod.sizes, ns],
                                  inventory: { ...(prod.inventory || {}), [ns]: 0 }
                               } : prod));
                             }
                          }} className="w-12 h-[68px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"><Plus className="w-5 h-5"/></button>
                       </div>
                       <button onClick={() => handleDelete(p.id)} className="p-5 text-red-100 hover:text-red-500 transition-all"><Trash className="w-7 h-7" /></button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="max-w-4xl space-y-8 pb-40">
               <div className="bg-gray-900 text-white p-12 rounded-[4rem] shadow-2xl flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Core Settings</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Manage Gakha Kids Identity</p>
                  </div>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl">Update Settings</button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">🖼️ Hero Identity</p>
                     <div className="space-y-4">
                        <input value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" placeholder="Line 1" />
                        <input value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-[var(--accent)]" placeholder="Line 2 (Accent)" />
                        <div className="flex gap-4 items-center">
                           <img src={config.hero?.backgroundImage} className="w-16 h-16 rounded-2xl object-cover" />
                           <label className="text-[11px] font-black text-blue-600 cursor-pointer underline hover:text-blue-700">
                              Change Hero Background
                              <input type="file" className="hidden" onChange={(e) => {
                                if(e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => setConfig({...config, hero: {...config.hero, backgroundImage: url}}));
                              }} />
                           </label>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">📱 Social & WA</p>
                     <div className="space-y-4">
                        <div>
                           <label className="text-[9px] uppercase opacity-50 block mb-1">Instagram</label>
                           <input value={config.socialMedia?.instagram} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, instagram: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" placeholder="Link Instagram" />
                        </div>
                        <div>
                           <label className="text-[9px] uppercase opacity-50 block mb-1">Reseller WhatsApp</label>
                           <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, resellerWhatsApp: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" placeholder="628..." />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">📢 Announcement</p>
                     <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic"><Percent className="w-4 h-4 text-orange-400" /> Flash Sale</p>
                     <div className="flex items-center gap-4">
                        <button onClick={() => setConfig({...config, flashSale: {...config.flashSale, isEnabled: !config.flashSale.isEnabled}})} className={`w-12 h-6 rounded-full relative transition-colors ${config.flashSale.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.flashSale.isEnabled ? 'left-7' : 'left-1'}`} /></button>
                        <span className="text-[10px] font-black uppercase tracking-widest">{config.flashSale.isEnabled ? 'ON' : 'OFF'}</span>
                     </div>
                     <input value={config.flashSale?.text} onChange={(e) => setConfig({...config, flashSale: {...config.flashSale, text: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" placeholder="Teks Promo Flash Sale" />
                  </div>
               </div>

               <div className="bg-white p-12 rounded-[4rem] border border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collections Engine</p>
                     <button onClick={() => setConfig({...config, productCategories: [...config.productCategories, {id: Date.now().toString(), name: 'Kategori Baru'}]})} className="text-[var(--accent)] font-black uppercase text-[10px] bg-pink-50 px-5 py-2 rounded-xl">+ Add Category</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {config.productCategories?.map((c: any, i: number) => (
                       <div key={i} className="flex gap-4 items-center bg-gray-50 p-3 pl-6 rounded-2xl border border-gray-100">
                          <input value={c.name} onChange={(e) => {
                             const newList = [...config.productCategories];
                             newList[i].name = e.target.value;
                             setConfig({...config, productCategories: newList});
                          }} className="flex-1 bg-transparent text-sm font-black outline-none" />
                          <button onClick={() => setConfig({...config, productCategories: config.productCategories.filter((_:any,idx:number)=>idx!==i)})} className="p-4 text-red-300 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                       </div>
                     ))}
                  </div>
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
                          <tr key={o.id} className="hover:bg-gray-50/50 group">
                             <td className="p-10 font-mono font-bold text-blue-600">#{o.id.toString().slice(-6)}</td>
                             <td className="p-10 font-black text-gray-900">{o.customer_name}</td>
                             <td className="p-10 font-black text-lg">Rp {o.total.toLocaleString()}</td>
                             <td className="p-10"><span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{o.status}</span></td>
                             <td className="p-10 text-right"><button onClick={() => setSelectedOrder(o)} className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-black group/btn ml-auto transition-all shadow-xl hover:scale-105"><Eye className="w-4 h-4" /> Detail</button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL ORDER DETAIL (PROPERTIES PRESERVED) */}
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
                           <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 flex items-start gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-green-500" /></div>
                              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">WhatsApp</p><p className="font-black text-xl">{selectedOrder.whatsapp}</p></div>
                           </div>
                           <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 flex items-start gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-blue-500" /></div>
                              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Shipping</p><p className="font-black text-sm">{selectedOrder.city}</p><p className="text-[11px] font-bold text-gray-400">{selectedOrder.address}</p></div>
                           </div>
                        </div>
                     </div>
                     <div className="w-full lg:w-[450px] bg-gray-950 text-white p-16 flex flex-col">
                        <h4 className="text-[11px] font-black uppercase text-gray-500 mb-10 tracking-widest">Cart Items ({selectedOrder.items?.length})</h4>
                        <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                           {selectedOrder.items?.map((it: any, i: number) => (
                             <div key={i} className="flex gap-6 items-center p-4 bg-white/5 rounded-3xl border border-white/5">
                                <img src={it.image} className="w-16 h-16 rounded-2xl object-cover" />
                                <div className="flex-1"><p className="text-sm font-black leading-tight mb-1">{it.name}</p><p className="text-[10px] font-black uppercase text-[var(--accent)]">{it.size} <span className="text-white/30 ml-2">Qty: {it.quantity}</span></p></div>
                             </div>
                           ))}
                        </div>
                        <div className="mt-12 pt-12 border-t border-white/10">
                           <div className="flex justify-between items-end mb-10"><span className="text-[11px] font-black uppercase text-gray-500">Grand Total</span><span className="text-4xl font-black text-[var(--accent)] tracking-tighter">Rp {selectedOrder.total.toLocaleString()}</span></div>
                           <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Completed')} className="w-full bg-[var(--accent)] hover:bg-pink-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all">Selesaikan Pesanan</button>
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
