import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell
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
    flashSale: { isEnabled: false, text: '', endTime: '' },
    newsletterPopup: { isEnabled: false, title: '', promoCode: '', description: '' },
    productCategories: [
      { id: 'born', name: 'New Born' },
      { id: 'baby', name: 'Baby' },
      { id: 'toddler', name: 'Toddler' }
    ],
    socialMedia: { instagram: '', tiktok: '', resellerWhatsApp: '', facebook: '' },
    hero: { headingLine1: '', headingLine2: '', description: '', backgroundImage: '' }
  });
  const [infoPages, setInfoPages] = useState<any[]>([]);
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
      const { data: iData } = await supabase.from('info_pages').select('*');
      if (iData) setInfoPages(iData);
      await refreshCoupons();
    } catch (e) {
      console.error(e);
    }
    setIsSyncing(false);
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Sinkronisasi ke Cloud...");
    try {
      await supabase.from('products').upsert(products);
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("Berhasil sinkron!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: "Produk Baru",
      price: "Rp 150.000",
      image: "https://via.placeholder.com/300",
      sizes: ["S", "M", "L", "XL"],
      inventory: { "S": 10, "M": 10, "L": 10, "XL": 10 },
      categories: [config.productCategories[0]?.id || 'born'],
      seoTitle: "",
      seoDescription: ""
    };
    setProducts([newProduct, ...products]);
    toast.success("Produk draf ditambahkan!");
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Hapus produk ini?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
    toast.success("Terhapus");
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const tid = toast.loading("Mengunggah...");
    try {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Selesai", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    }
  };

  const handleUpdateOrderStatus = async (orderId: any, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
       setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
       if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
       toast.success(`Status: ${newStatus}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-white font-black text-[10px] tracking-[0.4em] uppercase">Checking Cloud...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-gray-900 text-white p-8 hidden md:flex flex-col flex-shrink-0">
        <h2 className="text-2xl font-black mb-8 italic">Gakha <span className="text-[var(--accent)]">Admin</span></h2>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'analytics', label: 'Performa', icon: <Bell className="w-4 h-4" /> },
            { id: 'products', label: 'Produk', icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: 'Pesanan', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'coupons', label: 'Kupon', icon: <Zap className="w-4 h-4" /> },
            { id: 'resellers', label: 'Partner', icon: <User className="w-4 h-4" /> },
            { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-xl translate-x-1' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} <span className="font-bold text-xs uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 rounded-xl text-red-400 font-bold text-xs uppercase hover:bg-red-400/10">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="analytics" className="max-w-6xl">
               <h1 className="text-4xl font-black mb-10 tracking-tighter">STORE ANALYTICS</h1>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Total Omset</p>
                     <h3 className="text-3xl font-black">Rp {orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}</h3>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm font-bold text-blue-600">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Order Masuk</p>
                     <h3 className="text-3xl font-black">{orders.length}</h3>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
               <div className="flex justify-between items-center mb-10">
                  <h1 className="text-4xl font-black tracking-tighter">PRODUCT DATABASE</h1>
                  <div className="flex gap-4">
                     <button onClick={handleAddProduct} className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all flex items-center gap-2"><Plus className="w-5 h-5" /> Tambah Produk</button>
                     <button onClick={handlePushAllToCloud} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">🚀 Sync to Cloud</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-8 group">
                       <img src={p.image} className="w-20 h-20 rounded-[1.5rem] object-cover" />
                       <div className="flex-1 space-y-2">
                          <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full font-black text-lg p-1 outline-none focus:border-b-2 border-transparent focus:border-[var(--accent)]" />
                          <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full font-bold text-blue-600 outline-none text-sm" />
                       </div>
                       <div className="flex gap-2">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-50 border border-gray-100 rounded-xl p-2 min-w-[50px] text-center">
                               <p className="text-[8px] font-black text-gray-400 mb-1">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                 const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                 handleUpdateProduct(p.id, 'inventory', inv);
                               }} className="w-full bg-transparent text-center font-bold text-xs" />
                            </div>
                          ))}
                       </div>
                       <button onClick={() => handleDelete(p.id)} className="p-4 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash className="w-6 h-6" /></button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="max-w-3xl space-y-8 pb-40">
               <div className="flex justify-between items-center bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl">
                  <div>
                    <h1 className="text-2xl font-black uppercase italic">Store Settings</h1>
                    <p className="text-[10px] text-gray-400 tracking-widest mt-1">Config Gakha Kids Core Engine</p>
                  </div>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-8 py-3 rounded-2xl font-black text-xs">Update Settings</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Hero Banner Text</p>
                     <input value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl border border-transparent focus:border-[var(--accent)] outline-none" placeholder="Line 1" />
                     <input value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl" placeholder="Line 2 (Accent)" />
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-4 font-bold">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📢 Announcement Bar</p>
                     <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl" />
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 italic font-black">
                  <h4 className="text-xs mb-6 uppercase tracking-widest text-gray-400">Social Media & WhatsApp</h4>
                  <div className="grid grid-cols-2 gap-6">
                     {['instagram', 'resellerWhatsApp'].map(k => (
                       <div key={k}>
                          <label className="text-[9px] uppercase mb-2 block">{k}</label>
                          <input value={config.socialMedia?.[k]} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, [k]: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl not-italic font-mono text-xs" />
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 flex items-center justify-between">
                     Product Categories
                     <button onClick={() => setConfig({...config, productCategories: [...config.productCategories, {id: Date.now().toString(), name: 'New Category'}]})} className="text-[var(--accent)]">+ Add</button>
                  </h4>
                  <div className="space-y-3">
                     {config.productCategories?.map((c: any, i: number) => (
                       <div key={i} className="flex gap-3">
                          <input value={c.name} onChange={(e) => {
                             const newList = [...config.productCategories];
                             newList[i].name = e.target.value;
                             setConfig({...config, productCategories: newList});
                          }} className="flex-1 bg-gray-50 p-3 rounded-xl text-sm font-bold" />
                          <button onClick={() => setConfig({...config, productCategories: config.productCategories.filter((_:any,idx:number)=>idx!==i)})} className="p-3 text-red-300"><Trash className="w-4 h-4" /></button>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders">
               <h1 className="text-4xl font-black mb-10 tracking-tighter">ORDER REGISTRY</h1>
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
                        <tr>
                           <th className="p-8">Order ID</th>
                           <th className="p-8">Customer</th>
                           <th className="p-8">Amount</th>
                           <th className="p-8">Status</th>
                           <th className="p-8"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50">
                             <td className="p-8 font-mono font-bold text-blue-600">#{o.id.toString().slice(-6)}</td>
                             <td className="p-8 font-black text-gray-900">{o.customer_name}</td>
                             <td className="p-8 font-bold">Rp {o.total.toLocaleString()}</td>
                             <td className="p-8">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                                  o.status === 'Shipped' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                }`}>{o.status}</span>
                             </td>
                             <td className="p-8 text-right">
                                <button onClick={() => setSelectedOrder(o)} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black group ml-auto">
                                   <Eye className="w-4 h-4 group-hover:scale-125 transition-transform" /> Detail
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
                <div className="flex justify-between items-center mb-10">
                   <h1 className="text-4xl font-black">PROMO ENGINE</h1>
                   <button onClick={async () => {
                     const cCode = prompt('Kode Voucher:');
                     if(cCode) {
                        const val = prompt('Potongan (%):');
                        await supabase.from('coupons').insert([{ id: Date.now(), code: cCode.toUpperCase(), discount_type: 'Percentage', value: parseInt(val||'10'), status: 'Active' }]);
                        refreshCoupons();
                     }
                   }} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Create Coupon</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {coupons.map(c => (
                     <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-[var(--accent)] transition-all">
                        <div className="bg-gray-900 text-white px-5 py-2 rounded-xl font-mono font-bold text-lg mb-3 inline-block shadow-lg">{c.code}</div>
                        <p className="text-[10px] font-black uppercase text-green-500">Value: {c.value}% OFF</p>
                        <button onClick={async () => { await supabase.from('coupons').delete().eq('id', c.id); setCoupons(coupons.filter(x=>x.id!==c.id)); }} className="mt-4 text-red-300 hover:text-red-500 text-xs font-bold uppercase underline">Delete</button>
                     </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'resellers' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-4xl font-black mb-10 tracking-tighter">PARTNER DATABASE</h1>
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 p-8 tracking-widest">
                           <th className="p-8">Partner Name</th>
                           <th className="p-8">City</th>
                           <th className="p-8">WA Status</th>
                           <th className="p-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {resellers.map(r => (
                           <tr key={r.id}>
                              <td className="p-8 font-black">{r.name}</td>
                              <td className="p-8 text-gray-500 text-sm font-bold">{r.city}</td>
                              <td className="p-8"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black">Verified Partner</span></td>
                              <td className="p-8 text-right"><button onClick={async () => { await supabase.from('resellers').delete().eq('id', r.id); setResellers(resellers.filter(x=>x.id!==r.id)); }} className="text-red-300 hover:text-red-500"><Trash className="w-5 h-5"/></button></td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DETAIL VIEW MODAL */}
      <AnimatePresence>
         {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden relative">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100"><X className="w-6 h-6"/></button>
                  <div className="flex flex-col md:flex-row min-h-[500px]">
                     <div className="flex-1 p-12 lg:p-16 border-r border-gray-50">
                        <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">Order Overview</span>
                        <h2 className="text-4xl font-black mb-10 tracking-tighter leading-none">{selectedOrder.customer_name}</h2>
                        <div className="space-y-8">
                           <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-gray-400"/></div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-gray-400 mb-1">WhatsApp Contact</p>
                                 <p className="font-bold text-lg">{selectedOrder.whatsapp}</p>
                                 <a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="text-[var(--accent)] font-black uppercase text-[10px] flex items-center gap-1 mt-1">Direct WA Chat <ArrowRight className="w-3 h-3"/></a>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-gray-400"/></div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Shipping Address</p>
                                 <p className="font-bold text-sm leading-relaxed text-gray-800">{selectedOrder.city}</p>
                                 <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-xs">{selectedOrder.address}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="w-full md:w-[400px] bg-gray-900 text-white p-12 flex flex-col">
                        <h4 className="text-[10px] font-black uppercase text-gray-500 mb-8 tracking-widest">Cart Summary ({selectedOrder.items?.length})</h4>
                        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                           {selectedOrder.items?.map((it: any, i: number) => (
                             <div key={i} className="flex gap-4">
                                <img src={it.image} className="w-14 h-14 rounded-2xl object-cover" />
                                <div>
                                   <p className="text-xs font-bold leading-tight line-clamp-2">{it.name}</p>
                                   <p className="text-[10px] font-black uppercase text-gray-500 mt-1">{it.size} × {it.quantity}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="mt-10 pt-10 border-t border-white/10">
                           <div className="flex justify-between items-end mb-8">
                              <span className="text-[10px] font-black uppercase text-gray-500">Grand Total</span>
                              <span className="text-3xl font-black text-[var(--accent)] tracking-tighter">Rp {selectedOrder.total.toLocaleString()}</span>
                           </div>
                           <div className="flex flex-col gap-3">
                              {selectedOrder.status !== 'Shipped' && (
                                <div className="space-y-2">
                                   <input id="resi-input" placeholder="Enter Tracking / AWB" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-[var(--accent)]" />
                                   <button onClick={async () => {
                                      const r = (document.getElementById('resi-input') as HTMLInputElement).value;
                                      if(!r) return toast.error("Enter Resi!");
                                      await supabase.from('orders').update({status:'Shipped', tracking_number: r}).eq('id', selectedOrder.id);
                                      setSelectedOrder({...selectedOrder, status:'Shipped', tracking_number: r});
                                      toast.success("Ready to Ship!");
                                   }} className="w-full bg-green-600 py-3 rounded-xl font-black text-[10px] uppercase">Mark Shipped</button>
                                </div>
                              )}
                              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Completed')} className="w-full bg-blue-600 py-3 rounded-xl font-black text-[10px] uppercase">Selesaikan Pesanan</button>
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
