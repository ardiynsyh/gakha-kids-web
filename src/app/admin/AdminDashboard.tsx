import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell, Camera, 
  Layout, Sparkles, Percent
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
    flashSale: { isEnabled: false, text: 'FLASH SALE RAMADHAN!', endTime: '' },
    newsletterPopup: { isEnabled: false, title: 'Dapatkan Diskon 10%', promoCode: 'GAKHANEW', description: 'Daftar sekarang untuk mendapatkan update terbaru.' },
    productCategories: [
      { id: 'born', name: 'New Born' },
      { id: 'baby', name: 'Baby' },
      { id: 'toddler', name: 'Toddler' }
    ],
    socialMedia: { instagram: '', tiktok: '', resellerWhatsApp: '', facebook: '' },
    hero: { headingLine1: '', headingLine2: '', description: '', backgroundImage: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    setUser(user);
  };

  const refreshCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*');
    if (data) setCoupons(data);
  };

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (pData) setProducts(pData);
      const { data: cData } = await supabase.from('store_config').select('*').eq('id', 'main').maybeSingle();
      if (cData?.config_data) setConfig({ ...config, ...cData.config_data });
      const { data: resData } = await supabase.from('resellers').select('*').order('id', { ascending: false });
      if (resData) setResellers(resData);
      const { data: ordData } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (ordData) setOrders(ordData);
      await refreshCoupons();
    } catch (e) {
      console.error(e);
    }
    setIsSyncing(false);
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Menyimpan ke Cloud...");
    try {
      await supabase.from('products').upsert(products);
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("Berhasil Update!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const tid = toast.loading("Mengunggah Gambar...");
    try {
      const fileName = `gakha-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('products').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Gambar berhasil di-upload!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    }
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: "Nama Produk",
      price: "Rp 150.000",
      image: "https://images.unsplash.com/photo-1540855513560-112df639c947?auto=format&fit=crop&q=80&w=300",
      sizes: ["S", "M", "L", "XL"],
      inventory: { "S": 10, "M": 10, "L": 10, "XL": 10 },
      categories: [config.productCategories[0]?.id || 'born'],
      seoTitle: "",
      seoDescription: ""
    };
    setProducts([newProduct, ...products]);
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Hapus produk ini?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUpdateOrderStatus = async (orderId: any, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
       setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
       if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
       toast.success(`Pesanan ${newStatus}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-white font-black text-[10px] tracking-widest uppercase opacity-50">Syncing with Cloud...</p>
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
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 rounded-xl text-red-400 font-bold text-[10px] uppercase hover:bg-red-400/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-y-auto h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="analytics">
               <h1 className="text-5xl font-black mb-12 tracking-tighter">OVERVIEW</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShoppingBag className="w-20 h-20" /></div>
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Pendapatan Bersih</p>
                     <h3 className="text-4xl font-black italic">Rp {orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}</h3>
                  </div>
                  <div className="bg-gray-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10"><Bell className="w-20 h-20 text-[var(--accent)]" /></div>
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Total Transaksi</p>
                     <h3 className="text-4xl font-black italic">{orders.length}</h3>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
               <div className="flex justify-between items-center mb-12">
                  <h1 className="text-5xl font-black tracking-tighter">INVENTORY</h1>
                  <div className="flex gap-4">
                     <button onClick={handleAddProduct} className="bg-white border-2 border-gray-100 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2"><Plus className="w-5 h-5 text-[var(--accent)]" /> Add New</button>
                     <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">🚀 Sync Cloud</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-10 group hover:border-[var(--accent)]/30 transition-all">
                       <div className="relative w-28 h-28 flex-shrink-0 group/img">
                          <img src={p.image} className="w-full h-full rounded-[2rem] object-cover shadow-lg" />
                          <label className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                               if (e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                             }} />
                             <Camera className="w-8 h-8 text-white" />
                          </label>
                       </div>
                       <div className="flex-1 space-y-3">
                          <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full font-black text-2xl outline-none bg-transparent" placeholder="Product Name" />
                          <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full font-bold text-blue-600 outline-none text-base" placeholder="Price (e.g. Rp 150.000)" />
                       </div>
                       <div className="flex flex-wrap gap-3">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 min-w-[70px] text-center group/size relative">
                               <button 
                                 onClick={() => {
                                    const newSizes = p.sizes.filter((size: string) => size !== s);
                                    const newInv = { ...p.inventory };
                                    delete newInv[s];
                                    handleUpdateProduct(p.id, 'sizes', newSizes);
                                    handleUpdateProduct(p.id, 'inventory', newInv);
                                 }}
                                 className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] items-center justify-center opacity-0 group-hover/size:opacity-100 transition-opacity hidden group-hover/size:flex shadow-lg"
                               >
                                  <X className="w-3 h-3" />
                               </button>
                               <p className="text-[10px] font-black text-gray-400 mb-2">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                 const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                 handleUpdateProduct(p.id, 'inventory', inv);
                               }} className="w-full bg-transparent text-center font-black text-sm outline-none" />
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                               const newSizeName = prompt("Nama ukuran baru (contoh: XXL, 6Thn, dll):");
                               if (newSizeName && !p.sizes.includes(newSizeName)) {
                                  handleUpdateProduct(p.id, 'sizes', [...p.sizes, newSizeName]);
                                  handleUpdateProduct(p.id, 'inventory', { ...(p.inventory || {}), [newSizeName]: 0 });
                               }
                            }}
                            className="w-12 h-[74px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all hover:bg-white"
                          >
                             <Plus className="w-6 h-6" />
                          </button>
                       </div>
                       <button onClick={() => handleDelete(p.id)} className="p-5 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash className="w-6 h-6" /></button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="max-w-4xl space-y-8 pb-40">
               <div className="bg-gray-900 text-white p-12 rounded-[4rem] shadow-2xl flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">CORE CONFIG</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Manage Gakha Kids Ecosystem</p>
                  </div>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] hover:bg-pink-500 text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all">Update Settings</button>
               </div>

               {/* ALERT ENGINE */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Hero Identity</p>
                     <div className="space-y-4">
                        <input value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" placeholder="Hero Line 1" />
                        <input value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-[var(--accent)]" placeholder="Hero Line 2 (Accent)" />
                        <div className="flex gap-4 items-center pt-2">
                           <div className="w-16 h-16 bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
                              <img src={config.hero?.backgroundImage} className="w-full h-full object-cover" />
                           </div>
                           <label className="text-[10px] font-black uppercase text-blue-600 cursor-pointer hover:underline">
                              Ganti Hero BG
                              <input type="file" className="hidden" onChange={(e) => {
                                if(e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => setConfig({...config, hero: {...config.hero, backgroundImage: url}}));
                              }} />
                           </label>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 italic font-black space-y-6">
                     <h4 className="text-[10px] uppercase tracking-widest text-gray-400">Social Media & WhatsApp</h4>
                     <div className="space-y-4">
                        <div>
                           <label className="text-[9px] uppercase mb-2 block">Instagram Link</label>
                           <input value={config.socialMedia?.instagram} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, instagram: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl not-italic font-mono text-xs" placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                           <label className="text-[9px] uppercase mb-2 block">WA Reseller / CS</label>
                           <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, resellerWhatsApp: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl not-italic font-mono text-xs" placeholder="628123..." />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">📢 Announcement Bar</p>
                     <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm font-bold" placeholder="Teks Promo Atas" />
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic"><Percent className="w-4 h-4 text-orange-500" /> Flash Sale Engine</p>
                     <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => setConfig({...config, flashSale: {...config.flashSale, isEnabled: !config.flashSale.isEnabled}})} className={`w-12 h-6 rounded-full relative transition-colors ${config.flashSale.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.flashSale.isEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest">{config.flashSale.isEnabled ? 'ACTIVE' : 'DISABLED'}</span>
                     </div>
                     <input value={config.flashSale?.text} onChange={(e) => setConfig({...config, flashSale: {...config.flashSale, text: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm font-bold" placeholder="Sale Text" />
                  </div>
               </div>

               {/* NEWSLETTER CONFIG */}
               <div className="bg-white p-12 rounded-[4rem] border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic"><Sparkles className="w-4 h-4 text-purple-500" /> Newsletter Popup Config</p>
                     <button onClick={() => setConfig({...config, newsletterPopup: {...config.newsletterPopup, isEnabled: !config.newsletterPopup.isEnabled}})} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${config.newsletterPopup.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {config.newsletterPopup.isEnabled ? 'Auto-Popup Active' : 'Off'}
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <input value={config.newsletterPopup?.title} onChange={(e) => setConfig({...config, newsletterPopup: {...config.newsletterPopup, title: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-lg" placeholder="Popup Title" />
                        <textarea value={config.newsletterPopup?.description} onChange={(e) => setConfig({...config, newsletterPopup: {...config.newsletterPopup, description: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-2xl h-24 text-sm" placeholder="Description" />
                     </div>
                     <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">GIFT CODE ON SUCCESS</p>
                        <input value={config.newsletterPopup?.promoCode} onChange={(e) => setConfig({...config, newsletterPopup: {...config.newsletterPopup, promoCode: e.target.value}})} className="bg-gray-900 text-[var(--accent)] p-4 rounded-2xl font-mono text-2xl font-black text-center w-full uppercase shadow-xl" placeholder="KODE" />
                     </div>
                  </div>
               </div>

               {/* CATEGORIES ENGINE */}
               <div className="bg-white p-12 rounded-[4rem] border border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collections Engine</p>
                     <button onClick={() => setConfig({...config, productCategories: [...config.productCategories, {id: Date.now().toString(), name: 'Collection Name'}]})} className="text-[var(--accent)] font-black uppercase text-[10px] bg-pink-50 px-4 py-2 rounded-xl transition-all hover:bg-pink-100">+ Add Category</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {config.productCategories?.map((c: any, i: number) => (
                       <div key={i} className="flex gap-4 items-center bg-gray-50 p-2 pl-6 rounded-2xl border border-gray-100">
                          <span className="font-mono text-[10px] text-gray-300">#{i+1}</span>
                          <input value={c.name} onChange={(e) => {
                             const newList = [...config.productCategories];
                             newList[i].name = e.target.value;
                             setConfig({...config, productCategories: newList});
                          }} className="flex-1 bg-transparent p-3 rounded-xl text-sm font-black outline-none" />
                          <button onClick={() => setConfig({...config, productCategories: config.productCategories.filter((_:any,idx:number)=>idx!==i)})} className="p-4 text-red-300 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders">
               <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Registry</h1>
               <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">
                        <tr>
                           <th className="p-10">Serial ID</th>
                           <th className="p-10">Client</th>
                           <th className="p-10">Revenue</th>
                           <th className="p-10">Stage</th>
                           <th className="p-10"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 group transition-colors">
                             <td className="p-10 font-mono font-bold text-blue-600">ORD-{o.id.toString().slice(-6)}</td>
                             <td className="p-10 font-black text-gray-900">{o.customer_name}</td>
                             <td className="p-10 font-black text-xl">Rp {o.total.toLocaleString()}</td>
                             <td className="p-10">
                                <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                                  o.status === 'Shipped' ? 'bg-green-100 text-green-600 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-blue-100 text-blue-600'
                                }`}>{o.status}</span>
                             </td>
                             <td className="p-10 text-right">
                                <button onClick={() => setSelectedOrder(o)} className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-black group/btn ml-auto transition-all shadow-xl hover:scale-105">
                                   <Eye className="w-4 h-4 group-hover/btn:scale-125 transition-transform" /> Manage
                                </button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'coupons' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-12">
                   <h1 className="text-5xl font-black tracking-tighter">VOUCHERS</h1>
                   <button onClick={async () => {
                     const cCode = prompt('Promo Code:');
                     if(cCode) {
                        const val = prompt('Discount Value (%):');
                        await supabase.from('coupons').insert([{ id: Date.now(), code: cCode.toUpperCase(), discount_type: 'Percentage', value: parseInt(val||'10'), status: 'Active' }]);
                        refreshCoupons();
                     }
                   }} className="bg-gray-950 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Generate New</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {coupons.map(c => (
                     <div key={c.id} className="bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-[var(--accent)] transition-all flex flex-col items-center text-center shadow-xl group">
                        <div className="bg-gray-900 text-[var(--accent)] px-8 py-3 rounded-2xl font-mono font-black text-2xl mb-4 shadow-2xl group-hover:scale-110 transition-transform">{c.code}</div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-6">Value: {c.value}% Reductions</p>
                        <button onClick={async () => { await supabase.from('coupons').delete().eq('id', c.id); setCoupons(coupons.filter(x=>x.id!==c.id)); }} className="text-red-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Void Coupon</button>
                     </div>
                   ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DETAILED ORDER MODAL */}
      <AnimatePresence>
         {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-xl">
               <motion.div 
                 initial={{ y: 50, opacity: 0, scale: 0.9 }} 
                 animate={{ y: 0, opacity: 1, scale: 1 }} 
                 className="bg-white w-full max-w-5xl rounded-[5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden relative"
               >
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-12 right-12 p-5 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-900"><X className="w-6 h-6"/></button>
                  <div className="flex flex-col lg:flex-row min-h-[600px]">
                     <div className="flex-1 p-16 lg:p-20 border-r border-gray-100">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Transaction Detail</div>
                        <h2 className="text-5xl font-black mb-12 tracking-tighter leading-none">{selectedOrder.customer_name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 transition-transform hover:scale-105">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 text-green-500"><Phone className="w-6 h-6"/></div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-gray-400 mb-1">WhatsApp</p>
                                 <p className="font-black text-xl">{selectedOrder.whatsapp}</p>
                                 <a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="text-[var(--accent)] font-black uppercase text-[10px] flex items-center gap-1 mt-2 hover:underline">Launch Chat <ArrowRight className="w-3 h-3"/></a>
                              </div>
                           </div>
                           <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 transition-transform hover:scale-105">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 text-blue-500"><MapPin className="w-6 h-6"/></div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Logistics / City</p>
                                 <p className="font-black text-sm leading-relaxed text-gray-800">{selectedOrder.city}</p>
                                 <p className="text-[11px] font-bold text-gray-400 leading-relaxed mt-1">{selectedOrder.address}</p>
                              </div>
                           </div>
                        </div>
                        {selectedOrder.notes && (
                           <div className="mt-10 p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem]">
                              <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Customer Remarks</p>
                              <p className="text-sm font-bold italic text-blue-700">"{selectedOrder.notes}"</p>
                           </div>
                        )}
                     </div>
                     <div className="w-full lg:w-[450px] bg-gray-950 text-white p-16 flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                           <h4 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em]">Package Bundle ({selectedOrder.items?.length})</h4>
                           <span className="bg-[var(--accent)] px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">{selectedOrder.status}</span>
                        </div>
                        <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                           {selectedOrder.items?.map((it: any, i: number) => (
                             <div key={i} className="flex gap-6 items-center p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                                <img src={it.image} className="w-16 h-16 rounded-2xl object-cover shadow-2xl group-hover:scale-110 transition-transform" />
                                <div className="flex-1">
                                   <p className="text-sm font-black leading-tight mb-1">{it.name}</p>
                                   <p className="text-[10px] font-black uppercase text-[var(--accent)]">{it.size} <span className="text-white/30 ml-2">Qty: {it.quantity}</span></p>
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="mt-12 pt-12 border-t border-white/10">
                           <div className="flex justify-between items-end mb-10">
                              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Grand Total</span>
                              <span className="text-4xl font-black text-[var(--accent)] tracking-tighter">Rp {selectedOrder.total.toLocaleString()}</span>
                           </div>
                           <div className="flex flex-col gap-4">
                              {selectedOrder.status === 'Pending' && (
                                <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Processed')} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl">⚡ Process Now</button>
                              )}
                              {selectedOrder.status !== 'Shipped' ? (
                                <div className="space-y-3">
                                   <div className="relative">
                                      <input id="resi-box" placeholder="Input Tracking Number (AWB)" className="w-full bg-white/5 border border-white/10 p-5 rounded-[2rem] text-xs outline-none focus:border-[var(--accent)] pr-20" />
                                      <button onClick={async () => {
                                         const r = (document.getElementById('resi-box') as HTMLInputElement).value;
                                         if(!r) return toast.error("Enter Tracking!");
                                         await supabase.from('orders').update({status:'Shipped', tracking_number: r}).eq('id', selectedOrder.id);
                                         setSelectedOrder({...selectedOrder, status:'Shipped', tracking_number: r});
                                      }} className="absolute top-1/2 -ml-2 -translate-y-1/2 right-3 bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Post</button>
                                   </div>
                                </div>
                              ) : (
                                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[2.5rem] flex items-center justify-between">
                                   <div>
                                      <p className="text-[9px] font-black uppercase text-green-500 mb-1">Shipped with AWB</p>
                                      <p className="font-mono text-sm font-black tracking-tighter">{selectedOrder.tracking_number}</p>
                                   </div>
                                   <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                                </div>
                              )}
                              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Completed')} className="w-full bg-white/10 hover:bg-white/20 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest">Mark as Completed</button>
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
