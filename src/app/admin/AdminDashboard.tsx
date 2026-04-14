import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight 
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
    productCategories: [],
    navigation: { links: [] },
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

    // REAL-TIME NOTIFICATION SYSTEM
    const orderSubscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        setOrders(current => [newOrder, ...current]);
        toast.info(`🔔 PESANAN BARU! Dari ${newOrder.customer_name}`, {
          description: `Total: Rp ${newOrder.total.toLocaleString()}`,
          duration: 10000,
        });
        // Play notification sound
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
    setUser(user);
  };

  const refreshCoupons = async () => {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) return;
    setCoupons(data || []);
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
      if (ordData) setOrders(ordData || []);

      await refreshCoupons();

      const { data: iData } = await supabase.from('info_pages').select('*');
      if (iData) setInfoPages(iData);
    } catch (e) {
      console.error(e);
    }
    setIsSyncing(false);
  };

  const handleUpdateOrderStatus = async (orderId: any, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
       setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
       if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
       }
       toast.success(`Status diperbarui ke: ${newStatus}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const saveConfig = async () => {
    setIsLoading(true);
    const tid = toast.loading("Menyimpan...");
    try {
        await supabase.from('store_config').upsert({ id: 'main', config_data: config });
        toast.success("Berhasil!", { id: tid });
    } catch (e: any) {
        toast.error(e.message, { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const tid = toast.loading("Upload...");
    try {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Done", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Hapus?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Syncing...");
    try {
      await supabase.from('products').upsert(products);
      toast.success("Sync Berhasil", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
      <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-gray-500 animate-pulse text-[10px] uppercase tracking-widest">Gakha Cloud Sync...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 text-white p-8 hidden md:flex flex-col flex-shrink-0">
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-2">Gakha <span className="text-[var(--accent)]">Admin</span></h2>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Live Control
          </div>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: 'analytics', label: 'Performa', icon: <Clock className="w-5 h-5" /> },
            { id: 'products', label: 'Produk', icon: <Package className="w-5 h-5" /> },
            { id: 'orders', label: 'Pesanan', icon: <ShoppingBag className="w-5 h-5" /> },
            { id: 'coupons', label: 'Kupon', icon: <Zap className="w-5 h-5" /> },
            { id: 'resellers', label: 'Reseller', icon: <User className="w-5 h-5" /> },
            { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
              {tab.icon} <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors font-bold">
          <LogOut className="w-5 h-5" /> Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="analytics">
                <h1 className="text-3xl font-black mb-10">DASHBOARD ANALYTICS</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: "Omset", val: `Rp ${orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}`, icon: <Package className="text-green-500" /> },
                     { label: "Pesanan", val: orders.length, icon: <ShoppingBag className="text-blue-500" /> },
                     { label: "Produk", val: products.length, icon: <Zap className="text-yellow-500" /> },
                     { label: "Voucher", val: coupons.length, icon: <Edit3 className="text-purple-500" /> },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4">{stat.icon}</div>
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black">{stat.val}</h3>
                     </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'orders' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders">
                <h1 className="text-3xl font-black mb-8">ORDER REGISTRY</h1>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50">
                         <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                            <th className="p-6">ID</th>
                            <th className="p-6">Pelanggan</th>
                            <th className="p-6">Total</th>
                            <th className="p-6">Status</th>
                            <th className="p-6">Aksi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {orders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/50">
                               <td className="p-6 font-mono font-bold text-blue-600">ORD-{o.id.toString().slice(-6)}</td>
                               <td className="p-6 font-bold">{o.customer_name}</td>
                               <td className="p-6 font-black">Rp {o.total.toLocaleString()}</td>
                               <td className="p-6">
                                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    o.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                    o.status === 'Processed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                  }`}>{o.status}</span>
                               </td>
                               <td className="p-6">
                                  <button onClick={() => setSelectedOrder(o)} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-all flex items-center gap-2 text-[10px] font-black uppercase px-4">
                                     <Eye className="w-4 h-4" /> Detail
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}

          {activeTab === 'products' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
                <div className="flex justify-between items-center mb-8">
                   <h1 className="text-3xl font-black">KELOLA PRODUK</h1>
                   <button onClick={handlePushAllToCloud} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">Save Changes</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {products.map(p => (
                      <div key={p.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-6">
                         <img src={p.image} className="w-16 h-16 rounded-xl object-cover" />
                         <div className="flex-1">
                            <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="font-bold text-gray-900 outline-none w-full" />
                            <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="text-gray-400 text-sm outline-none w-full" />
                         </div>
                         <div className="flex gap-2">
                            {p.sizes?.map((s: string) => (
                               <div key={s} className="bg-gray-50 p-2 rounded-lg border border-gray-100 min-w-[50px] text-center">
                                  <p className="text-[8px] font-black text-gray-400">{s}</p>
                                  <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                     const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                     handleUpdateProduct(p.id, 'inventory', inv);
                                  }} className="w-full bg-transparent text-center font-bold text-xs" />
                               </div>
                            ))}
                         </div>
                         <button onClick={() => handleDelete(p.id)} className="p-3 text-red-300 hover:text-red-500"><Trash className="w-5 h-5" /></button>
                      </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'settings' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="max-w-2xl pb-40">
                <div className="flex justify-between items-center mb-8">
                   <h1 className="text-3xl font-black">PENGATURAN</h1>
                   <button onClick={saveConfig} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl">Simpan</button>
                </div>
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-2xl border border-gray-100">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Announcement Bar</label>
                      <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl outline-none" />
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-gray-100">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Social - WhatsApp Reseller</label>
                      <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, resellerWhatsApp: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl outline-none" />
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'coupons' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="coupons" className="pb-40">
                <div className="flex justify-between items-center mb-10">
                   <h1 className="text-4xl font-black">PROMO ENGINE</h1>
                   <div className="flex gap-4">
                      <button onClick={refreshCoupons} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"><Clock className="w-5 h-5" /></button>
                      <button onClick={async () => {
                         const code = prompt('Kode:');
                         if(!code) return;
                         const vStr = prompt('Diskon (%):');
                         const newC = { id: Date.now(), code: code.toUpperCase(), discount_type: 'Percentage', value: parseInt(vStr || '10'), status: 'Active' };
                         await supabase.from('coupons').insert([newC]);
                         await refreshCoupons();
                         toast.success("Kupon Aktif!");
                      }} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Buat Kupon</button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {coupons.map(c => (
                      <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group">
                         <div>
                            <div className="bg-gray-900 text-white px-4 py-1 rounded-lg font-mono font-bold text-lg mb-2">{c.code}</div>
                            <p className="text-[10px] uppercase font-black text-green-500">Diskon {c.value}%</p>
                         </div>
                         <button onClick={async () => {
                            await supabase.from('coupons').delete().eq('id', c.id);
                            setCoupons(coupons.filter(cp => cp.id !== c.id));
                         }} className="p-3 text-red-300 group-hover:text-red-500 transition-colors"><Trash className="w-6 h-6" /></button>
                      </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'resellers' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="resellers">
                <div className="flex justify-between items-center mb-8">
                   <h1 className="text-3xl font-black">RESELLER DATABASE</h1>
                   <button onClick={async () => {
                      const name = prompt('Nama:');
                      if(name) {
                         const n = { name, city: '', whatsapp: '', status: 'Active' };
                         const { data } = await supabase.from('resellers').insert([n]).select();
                         if(data) setResellers([data[0], ...resellers]);
                      }
                   }} className="bg-[var(--accent)] text-white px-8 py-3 rounded-xl font-bold">Add Partner</button>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                            <th className="p-6">Nama</th>
                            <th className="p-6">Kota</th>
                            <th className="p-6">WhatsApp</th>
                            <th className="p-6">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {resellers.map(r => (
                            <tr key={r.id}>
                               <td className="p-6 font-bold">{r.name}</td>
                               <td className="p-6">{r.city}</td>
                               <td className="p-6 font-mono text-xs">{r.whatsapp}</td>
                               <td className="p-6"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black italic">Active Part</span></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ORDER DETAIL MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative"
             >
                <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                
                <div className="p-10 pb-0">
                   <div className="flex items-center gap-4 mb-2">
                       <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Order Detail</span>
                       <span className="text-gray-300 font-bold text-xs tracking-tighter">ID: ORD-{selectedOrder.id}</span>
                   </div>
                   <h2 className="text-3xl font-black text-gray-900 mb-8">{selectedOrder.customer_name}</h2>
                </div>

                <div className="p-10 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                         <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Kontak Pelanggan
                         </h4>
                         <p className="font-bold text-gray-900 text-lg mb-1">{selectedOrder.whatsapp}</p>
                         <a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Chat via WhatsApp <ArrowRight className="w-3 h-3" /></a>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                         <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Alamat Pengiriman
                         </h4>
                         <p className="text-sm font-bold text-gray-900 leading-relaxed mb-2">{selectedOrder.city}</p>
                         <p className="text-xs text-gray-500 leading-relaxed">{selectedOrder.address}</p>
                         {selectedOrder.notes && (
                            <div className="mt-4 p-3 bg-white/50 border border-gray-200 rounded-xl text-[10px] italic text-gray-400">
                               Note: "{selectedOrder.notes}"
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col h-full">
                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Barang Dipesan</h4>
                      <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                         {selectedOrder.items?.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4 items-center border-b border-white/5 pb-4 last:border-0">
                               <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                               <div className="flex-1">
                                  <p className="text-[11px] font-bold line-clamp-1">{item.name}</p>
                                  <p className="text-[9px] text-gray-400 uppercase font-black">{item.size} × {item.quantity}</p>
                               </div>
                               <p className="text-xs font-black">Rp {item.price.toLocaleString()}</p>
                            </div>
                         ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-gray-400">Total Pembayaran</span>
                            <span className="text-2xl font-black text-[var(--accent)]">Rp {selectedOrder.total.toLocaleString()}</span>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Processed')}
                              className={`flex items-center justify-center p-3 rounded-xl transition-all ${selectedOrder.status === 'Processed' ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                               <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Canceled')}
                              className="bg-white/10 text-red-400 p-3 rounded-xl hover:bg-red-400/20 transition-all font-bold text-[10px] uppercase"
                            >
                               Hapus/Batal
                            </button>
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
