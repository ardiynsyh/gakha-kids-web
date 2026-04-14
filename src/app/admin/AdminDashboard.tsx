import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell, Camera, 
  Layout, Sparkles, Percent, Tag, RefreshCw, Printer, Calendar, TrendingUp, BarChart3, ChevronRight, MessageSquare, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'orders' | 'coupons' | 'analytics'>('analytics');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAddingSize, setIsAddingSize] = useState<any>(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [config, setConfig] = useState<any>({
    announcement: { isEnabled: true, text: '' },
    flashSale: { isEnabled: false, text: '', endTime: '' },
    productCategories: [
      { id: 'all', name: 'SEMUA' },
      { id: 'born', name: 'NEW BORN' },
      { id: '0-6', name: '0-6 BLN' },
      { id: '6-12', name: '6-12 BLN' },
      { id: '1-5', name: '1-5 THN' },
      { id: '5-12', name: '5-12 THN' },
      { id: 'boys', name: 'LAKI-LAKI' },
      { id: 'girls', name: 'PEREMPUAN' },
      { id: 'baby', name: 'BAYI' },
      { id: 'toddler', name: 'TODDLER' }
    ],
    socialMedia: { instagram: '', resellerWhatsApp: '' },
    hero: { headingLine1: '', headingLine2: '', description: '', backgroundImage: '' }
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
    const tid = toast.loading("Saving Dashboard...");
    try {
      for (const product of products) {
        await supabase.from('products').upsert(product, { onConflict: 'id' });
      }
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("All Synced!", { id: tid });
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
      categories: [selectedCategory === 'all' ? 'born' : selectedCategory],
      sizes: ["S", "M", "L"],
      inventory: { "S": 10, "M": 10, "L": 10 }
    };
    setProducts([newProduct, ...products]);
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const tid = toast.loading("Uploading...");
    try {
      const fileName = `gakha-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Photo Updated!", { id: tid });
    } catch (e: any) { toast.error(e.message, { id: tid }); }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => selectedCategory === 'all' || p.categories?.includes(selectedCategory));

  // Recaps
  const dailyRecap = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((acc, o) => acc + (o.total || 0), 0);
  const monthlyRecap = orders.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth()).reduce((acc, o) => acc + (o.total || 0), 0);
  const bestSellers = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);

  if (isSyncing) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-24 lg:w-80 bg-gray-950 text-white p-6 lg:p-10 flex flex-col flex-shrink-0 transition-all">
        <div className="flex items-center gap-3 mb-16 justify-center lg:justify-start">
           <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-3xl font-black">G</div>
           <h2 className="text-2xl font-black italic tracking-tighter hidden lg:block">Gakha<span className="text-[var(--accent)]">Admin</span></h2>
        </div>
        <nav className="space-y-4 flex-1">
          {[
            { id: 'analytics', label: 'Monitor', icon: <BarChart3 className="w-6 h-6" /> },
            { id: 'products', label: 'Produk', icon: <Package className="w-6 h-6" /> },
            { id: 'orders', label: 'Penjualan', icon: <ShoppingBag className="w-6 h-6" /> },
            { id: 'coupons', label: 'Kupon', icon: <Zap className="w-6 h-6" /> },
            { id: 'settings', label: 'Konfigurasi', icon: <Settings className="w-6 h-6" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 p-4 lg:p-5 rounded-[1.5rem] transition-all relative group ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
              {tab.icon} <span className="font-black text-[11px] uppercase tracking-widest hidden lg:block">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full hidden lg:block" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="analytics" className="p-8 lg:p-16">
               <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-12">Performance Monitor</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Hari Ini</p>
                     <p className="text-3xl font-black text-green-600">Rp {dailyRecap.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Bulan Ini</p>
                     <p className="text-3xl font-black text-blue-600">Rp {monthlyRecap.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                     <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Total Orders</p>
                     <p className="text-4xl font-black italic">{orders.length}</p>
                     <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products" className="p-0">
               {/* CATEGORY TABS (FIXED AT TOP) */}
               <div className="sticky top-0 z-20 bg-gray-100 p-8 lg:px-16 pb-4 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-200 shadow-sm">
                  <div className="flex flex-wrap gap-2 justify-center">
                     {config.productCategories.map((c: any) => (
                       <button 
                        key={c.id} 
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c.id ? 'bg-gray-950 text-white shadow-xl scale-105' : 'bg-white text-gray-400 hover:text-gray-900'}`}
                       >
                         {c.name}
                       </button>
                     ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddProduct} className="bg-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-blue-100 text-blue-600 hover:bg-blue-50 transition-all"><Plus className="w-4 h-4" /> Add Item</button>
                    <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                       <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Cloud
                    </button>
                  </div>
               </div>

               <div className="p-8 lg:p-16 space-y-4">
                  <div className="flex items-center gap-3 mb-6 opacity-30">
                     <Filter className="w-4 h-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest italic">Showing: {config.productCategories.find((c:any)=>c.id===selectedCategory)?.name}</p>
                  </div>
                  
                  {filteredProducts.map(p => {
                    const priceNum = parseInt(p.price?.replace(/[^0-9]/g, '')) || 0;
                    const origNum = parseInt(p.originalPrice?.replace(/[^0-9]/g, '') || '0');
                    const disc = origNum > priceNum ? Math.round(((origNum-priceNum)/origNum)*100) : 0;

                    return (
                    <div key={p.id} className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all flex flex-col lg:flex-row items-center gap-8 relative">
                       {/* Compact Image */}
                       <div className="relative w-28 h-28 flex-shrink-0 group/img">
                          <img src={p.image} className="w-full h-full rounded-[1.8rem] object-cover shadow-lg" />
                          <label className="absolute inset-0 bg-black/50 rounded-[1.8rem] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                             <input type="file" className="hidden" onChange={(e) => {
                               if(e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                             }} />
                             <Camera className="w-8 h-8 text-white" />
                          </label>
                          {disc > 0 && <div className="absolute -top-2 -right-2 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg">-{disc}%</div>}
                       </div>

                       {/* Info Section */}
                       <div className="flex-1 space-y-3 w-full">
                          <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full font-black text-xl outline-none bg-gray-50/50 p-2 px-4 rounded-xl border border-transparent focus:border-gray-100" />
                          <div className="flex gap-3">
                             <div className="flex-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase px-2">Jual</label>
                                <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full text-blue-600 font-bold text-sm bg-gray-50/50 p-1.5 px-4 rounded-xl border border-transparent focus:border-blue-100 outline-none" placeholder="Price" />
                             </div>
                             <div className="flex-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase px-2">Coret</label>
                                <input value={p.originalPrice} onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)} className="w-full text-red-300 font-bold text-sm bg-gray-50/50 p-1.5 px-4 rounded-xl border border-transparent focus:border-red-100 outline-none" placeholder="Original" />
                             </div>
                             <div className="flex-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase px-2">Kategori</label>
                                <select value={p.categories?.[0] || 'all'} onChange={(e)=>handleUpdateProduct(p.id, 'categories', [e.target.value])} className="w-full text-[9px] font-black p-2 rounded-xl bg-pink-50 text-[var(--accent)] outline-none border-none cursor-pointer">
                                   {config.productCategories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>

                       {/* Compact Sizes Row */}
                       <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-950 text-white rounded-2xl p-2.5 min-w-[65px] text-center relative shadow-md">
                               <p className="text-[8px] font-black text-gray-500 mb-1 uppercase">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                                 const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                 handleUpdateProduct(p.id, 'inventory', inv);
                               }} className="w-full bg-transparent text-center font-black text-sm outline-none text-[var(--accent)]" />
                            </div>
                          ))}
                          <button onClick={() => setIsAddingSize(p.id)} className="w-10 h-10 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)] bg-gray-50/50"><Plus className="w-5 h-5" /></button>
                       </div>

                       {/* Action Delete */}
                       <div className="flex-shrink-0">
                          <button onClick={() => { if(confirm('Hapus?')) { supabase.from('products').delete().eq('id', p.id).then(()=>fetchData()); } }} className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash className="w-5 h-5" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders" className="p-8 lg:p-16">
               <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Sales Registry</h1>
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden text-sm">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[9px] uppercase font-black tracking-[0.4em] text-gray-400"><tr className="border-b border-gray-100"><th className="p-8">ID</th><th className="p-8">Customer</th><th className="p-8">Amount</th><th className="p-8">Status</th><th className="p-8">Actions</th></tr></thead>
                     <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                             <td className="p-8 font-mono font-bold text-gray-400 text-xs">#{o.id.toString().slice(-6)}</td>
                             <td className="p-8 font-black text-gray-950 uppercase text-xs">{o.customer_name}</td>
                             <td className="p-8 font-black text-gray-900">Rp {o.total.toLocaleString()}</td>
                             <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{o.status}</span></td>
                             <td className="p-8"><button onClick={() => setSelectedOrder(o)} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all"><Eye className="w-3 h-3 text-[var(--accent)]" /> Manage</button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="p-8 lg:p-16 max-w-4xl space-y-10">
               <div className="bg-gray-950 text-white p-12 rounded-[4rem] shadow-2xl flex justify-between items-center relative overflow-hidden">
                  <h1 className="text-4xl font-black italic uppercase italic tracking-tighter relative z-10">Global Config</h1>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl relative z-10">Save Changes</button>
                  <Settings className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
               </div>
               
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">📢 Announcement Bar</p>
                  <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-orange-50/50 p-5 rounded-2xl outline-none border border-orange-100 font-bold text-orange-600" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* POPUP SIZE (REFINED) */}
      <AnimatePresence>
         {isAddingSize && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xs text-center">
                  <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase italic">New Size</h3>
                  <input id="szInput" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-2xl text-center mb-8 border border-gray-100" placeholder="EX: 4Y" autoFocus />
                  <div className="flex gap-4">
                     <button onClick={() => setIsAddingSize(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-gray-400">Cancel</button>
                     <button onClick={() => {
                        const v = (document.getElementById('szInput') as HTMLInputElement).value;
                        if(v) {
                          setProducts(prev => prev.map(p => p.id === isAddingSize ? { ...p, sizes: [...(p.sizes||[]), v.toUpperCase()], inventory: { ...(p.inventory||{}), [v.toUpperCase()]: 0 } } : p));
                          setIsAddingSize(null);
                        }
                     }} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg">Add</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* MODAL ORDER (REFINED COMPACT) */}
      <AnimatePresence>
         {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-xl">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden relative">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 p-5 bg-gray-100 rounded-3xl text-gray-400 z-10"><X className="w-6 h-6"/></button>
                  <div className="flex flex-col lg:flex-row min-h-[600px]">
                     <div className="flex-1 p-12 lg:p-20 overflow-y-auto">
                        <p className="text-[10px] font-black uppercase text-blue-500 mb-4 font-mono tracking-widest italic">Order Details</p>
                        <h2 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">{selectedOrder.customer_name}</h2>
                        
                        <div className="space-y-4 mb-12">
                           <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex gap-5">
                              <MapPin className="text-blue-500 w-6 h-6" />
                              <div className="text-sm">
                                <p className="font-black mb-1 uppercase tracking-tight">{selectedOrder.city}</p>
                                <p className="text-gray-400 leading-relaxed">{selectedOrder.address}</p>
                              </div>
                           </div>
                           <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex gap-5">
                              <Phone className="text-green-500 w-6 h-6" />
                              <div className="flex-1">
                                <p className="font-black mb-3">{selectedOrder.whatsapp}</p>
                                <a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="text-[9px] font-black uppercase inline-block bg-green-500 text-white px-5 py-2 rounded-xl shadow-lg">Chat WhatsApp</a>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <input id="awb" value={selectedOrder.tracking_number} onChange={(e)=>setSelectedOrder({...selectedOrder, tracking_number: e.target.value})} className="flex-1 bg-gray-50 p-5 rounded-2xl outline-none font-bold shadow-inner" placeholder="AWB / NO RESI" />
                           <button onClick={()=>{
                              const a = (document.getElementById('awb') as HTMLInputElement).value;
                              if(a) {
                                supabase.from('orders').update({ tracking_number: a, status: 'Shipped' }).eq('id', selectedOrder.id).then(() => {
                                   fetchData(); setSelectedOrder(null); toast.success("AWB Saved!");
                                   window.open(`https://wa.me/${selectedOrder.whatsapp}?text=${encodeURIComponent(`Halo ${selectedOrder.customer_name}, pesanan Anda sedang dikirim dengan resi: *${a}*.`)}`);
                                });
                              }
                           }} className="bg-blue-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase shadow-xl">Update & Send WA</button>
                        </div>
                     </div>
                     <div className="w-full lg:w-[400px] bg-gray-950 text-white p-12 lg:p-16 flex flex-col">
                        <h4 className="text-[10px] font-black uppercase text-gray-500 mb-10 italic">Cart Items</h4>
                        <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                           {selectedOrder.items?.map((it: any, i: number) => (
                             <div key={i} className="flex gap-6 items-center">
                                <img src={it.image} className="w-16 h-16 rounded-2xl object-cover border border-white/5" />
                                <div><p className="text-xs font-black italic">{it.name}</p><p className="text-[9px] font-black uppercase text-[var(--accent)]">{it.size} x{it.quantity}</p></div>
                             </div>
                           ))}
                        </div>
                        <div className="pt-10 border-t border-white/10 mt-10">
                           <div className="flex justify-between items-end mb-8"><span className="text-[10px] font-black uppercase text-gray-400">Total</span><span className="text-3xl font-black text-[var(--accent)]">Rp {selectedOrder.total.toLocaleString()}</span></div>
                           <button onClick={()=>{ supabase.from('orders').update({status:'Completed'}).eq('id',selectedOrder.id).then(()=>{fetchData(); setSelectedOrder(null);}); }} className="w-full bg-[var(--accent)] text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95">Complete Order</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
      `}</style>
    </div>
  );
}
