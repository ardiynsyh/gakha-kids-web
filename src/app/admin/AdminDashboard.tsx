import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck, 
  Eye, X, Phone, MapPin, CheckCircle, ArrowRight, Bell, Camera, 
  Layout, Sparkles, Percent, Tag, RefreshCw, Printer, Calendar, TrendingUp, BarChart3, ChevronRight, MessageSquare, Filter, Ruler
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
      { id: '0-6', name: '0-6 BULAN' },
      { id: '6-12', name: '6-12 BULAN' },
      { id: '1-5', name: '1-5 TAHUN' },
      { id: '5-12', name: '5-12 TAHUN' },
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
      if (cData?.config_data) setConfig({ ...cData.config_data });
      const { data: ordData } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (ordData) setOrders(ordData);
      const { data: coupData } = await supabase.from('coupons').select('*');
      if (coupData) setCoupons(coupData);
    } catch (e) { console.error(e); }
    setIsSyncing(false);
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Sinkronisasi Global...");
    try {
      for (const product of products) {
        await supabase.from('products').upsert(product, { onConflict: 'id' });
      }
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("Tersimpan ke Cloud!", { id: tid });
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
      sizes: ["S", "M"],
      inventory: { "S": 10, "M": 10 }
    };
    setProducts([newProduct, ...products]);
  };

  const handlePrintLabel = (order: any) => {
    const w = window.open('', '_blank');
    if(w) {
      w.document.write(`<html><body style="font-family:sans-serif;padding:40px;border:5px solid black;border-radius:30px;max-width:500px">
        <h1 style="border-bottom:3px solid #eee;padding-bottom:10px">GAKHA KIDS - LABEL</h1>
        <p><strong>KEPADA:</strong> ${order.customer_name}</p>
        <p><strong>WA:</strong> ${order.whatsapp}</p>
        <p><strong>ALAMAT:</strong> ${order.address}, ${order.city}</p>
        <hr/>
        <p><strong>ISI PAKET:</strong><br/>${order.items?.map((it:any)=>`• ${it.name} (${it.size}) x${it.quantity}`).join('<br/>')}</p>
        <h2 style="margin-top:20px">TAGIHAN: Rp ${order.total.toLocaleString()}</h2>
        <script>window.print()</script>
      </body></html>`);
      w.document.close();
    }
  };

  // Analytics
  const dailyRecap = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((acc, o) => acc + (o.total || 0), 0);
  const monthlyRecap = orders.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth()).reduce((acc, o) => acc + (o.total || 0), 0);
  const bestSellers = [...products].sort((a,b) => (b.sold||0)-(a.sold||0)).slice(0,3);
  const filteredProducts = products.filter(p => selectedCategory === 'all' || p.categories?.includes(selectedCategory));

  if (isSyncing) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 p-4 lg:p-5 rounded-[1.5rem] transition-all relative ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
              {tab.icon} <span className="font-black text-[11px] uppercase tracking-widest hidden lg:block">{tab.label}</span>
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
                  <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2">HARI INI</p>
                     <p className="text-4xl font-black text-green-600">Rp {dailyRecap.toLocaleString()}</p>
                  </div>
                   <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2">BULAN INI</p>
                     <p className="text-4xl font-black text-blue-600">Rp {monthlyRecap.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-900 text-white p-12 rounded-[4rem] shadow-2xl">
                     <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest italic">BEST SELLERS</p>
                     <div className="flex gap-4">
                        {bestSellers.map(p => <img key={p.id} src={p.image} className="w-12 h-12 rounded-xl object-cover border border-white/10" title={p.name} />)}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products">
               <div className="sticky top-0 z-20 bg-gray-100 p-8 lg:px-16 pb-4 border-b border-gray-200 shadow-sm">
                  <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                       {config.productCategories.map((c: any) => (
                         <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c.id ? 'bg-gray-950 text-white shadow-xl' : 'bg-white text-gray-400 hover:text-gray-900'}`}>{c.name}</button>
                       ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleAddProduct} className="bg-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase border border-blue-100 text-blue-600 hover:bg-blue-50">Add Item</button>
                      <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                         <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Cloud
                      </button>
                    </div>
                  </div>
               </div>
               <div className="p-8 lg:p-16 space-y-4">
                  {filteredProducts.map(p => {
                    const priceNum = parseInt(p.price?.replace(/[^0-9]/g, '')) || 0;
                    const origNum = parseInt(p.originalPrice?.replace(/[^0-9]/g, '') || '0');
                    const disc = origNum > priceNum ? Math.round(((origNum-priceNum)/origNum)*100) : 0;
                    return (
                    <div key={p.id} className="bg-white p-6 lg:p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-8 group">
                       <div className="relative w-28 h-28 flex-shrink-0">
                          <img src={p.image} className="w-full h-full rounded-[2rem] object-cover shadow-lg" />
                          <label className="absolute inset-0 bg-black/50 rounded-[2rem] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                             <input type="file" className="hidden" onChange={(e) => { if(e.target.files?.[0]) { const f = e.target.files[0]; const tid = toast.loading("Uploading..."); const fName = `gakha-${Date.now()}.${f.name.split('.').pop()}`; supabase.storage.from('products').upload(fName, f).then(() => { const { data } = supabase.storage.from('products').getPublicUrl(fName); handleUpdateProduct(p.id, 'image', data.publicUrl); toast.success("Updated!", { id: tid }); }); } }} />
                             <Camera className="w-8 h-8 text-white" />
                          </label>
                          {disc > 0 && <div className="absolute -top-2 -right-2 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg">-{disc}%</div>}
                       </div>
                       <div className="flex-1 space-y-3 w-full">
                          <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full font-black text-xl outline-none bg-gray-50/20 p-2 px-4 rounded-xl" />
                          <div className="flex gap-3">
                             <div className="flex-1"><label className="text-[8px] font-black text-gray-400 uppercase px-2">Harga Jual</label><input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full text-blue-600 font-bold bg-gray-50/50 p-2 px-4 rounded-xl outline-none" placeholder="Price" /></div>
                             <div className="flex-1"><label className="text-[8px] font-black text-gray-400 uppercase px-2">Harga Coret</label><input value={p.originalPrice} onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)} className="w-full text-red-300 font-bold bg-red-50/20 p-2 px-4 rounded-xl outline-none" placeholder="Original" /></div>
                             <div className="flex-1"><label className="text-[8px] font-black text-gray-400 uppercase px-2">Kategori</label><select value={p.categories?.[0] || 'all'} onChange={(e)=>handleUpdateProduct(p.id, 'categories', [e.target.value])} className="w-full text-[9px] font-black p-2 rounded-xl bg-pink-50 text-[var(--accent)] outline-none border-none cursor-pointer">{config.productCategories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                          </div>
                       </div>
                       <div className="flex-shrink-0 flex items-center gap-2">
                          {p.sizes?.map((s: string) => (
                            <div key={s} className="bg-gray-950 text-white rounded-2xl p-2.5 min-w-[65px] text-center relative">
                               <p className="text-[8px] font-black text-gray-500 mb-1 uppercase">{s}</p>
                               <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => { const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 }; handleUpdateProduct(p.id, 'inventory', inv); }} className="w-full bg-transparent text-center font-black text-sm outline-none text-[var(--accent)]" />
                               <button onClick={() => { const ns = p.sizes.filter((sz: string) => sz !== s); const ni = { ...p.inventory }; delete ni[s]; handleUpdateProduct(p.id, 'sizes', ns); handleUpdateProduct(p.id, 'inventory', ni); }} className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 hover:opacity-100 transition-opacity">X</button>
                            </div>
                          ))}
                          <button onClick={() => setIsAddingSize(p.id)} className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"><Plus className="w-5 h-5" /></button>
                       </div>
                       <button onClick={() => { if(confirm('Hapus?')) { supabase.from('products').delete().eq('id', p.id).then(()=>fetchData()); } }} className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash className="w-5 h-5" /></button>
                    </div>
                  )})}
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders" className="p-8 lg:p-16">
               <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Sales Registry</h1>
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden text-sm">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[9px] uppercase font-black tracking-[0.4em] text-gray-400"><tr className="border-b border-gray-100"><th className="p-10">ID</th><th className="p-10">Customer</th><th className="p-10">Amount</th><th className="p-10">Status</th><th className="p-10">Actions</th></tr></thead>
                     <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                             <td className="p-10 font-mono font-bold text-gray-400 text-xs">#{o.id.toString().slice(-6)}</td>
                             <td className="p-10 font-black text-gray-950 uppercase text-xs">{o.customer_name}</td>
                             <td className="p-10 font-black text-lg">Rp {o.total.toLocaleString()}</td>
                             <td className="p-10"><span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{o.status}</span></td>
                             <td className="p-10"><button onClick={() => setSelectedOrder(o)} className="bg-gray-950 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-xl"><Eye className="w-3 h-3 text-[var(--accent)]" /> Manage</button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'coupons' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="coupons" className="p-8 lg:p-16">
               <div className="flex justify-between items-center mb-16">
                  <h1 className="text-5xl font-black tracking-tighter uppercase italic">Voucher Engine</h1>
                  <button onClick={() => setIsAddingCoupon(true)} className="bg-gray-950 text-white px-10 py-4 rounded-[2rem] font-black text-[12px] uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-3"><Plus className="w-5 h-5 text-[var(--accent)]" /> New Voucher</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {coupons.map(c => {
                    const isExp = c.expiry_date && new Date(c.expiry_date) < new Date();
                    if(isExp) return null;
                    return (
                    <div key={c.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group relative">
                       <p className="absolute top-8 right-8 text-[8px] font-black uppercase text-gray-400">{c.expiry_date || 'NO EXPIRY'}</p>
                       <div className="bg-gray-950 text-[var(--accent)] px-8 py-3 rounded-2xl font-mono font-black text-2xl mb-4 group-hover:scale-110 transition-transform">{c.code}</div>
                       <p className="text-3xl font-black mb-2">{c.value}% OFF</p>
                       <button onClick={async () => { await supabase.from('coupons').delete().eq('id', c.id); fetchData(); }} className="mt-4 text-red-500 font-black text-[9px] uppercase underline">Delete</button>
                    </div>
                  )})}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="p-8 lg:p-16 max-w-4xl space-y-10">
               <div className="bg-gray-950 text-white p-12 rounded-[4rem] shadow-2xl flex justify-between items-center relative overflow-hidden">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">Global Config</h1>
                  <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl relative z-10">Save Changes</button>
                  <Settings className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">🖼️ Hero Display</p>
                     <input value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold" placeholder="Line 1" />
                     <input value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-xl font-black text-[var(--accent)]" placeholder="Line 2" />
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">📱 Social & WA</p>
                     <input value={config.socialMedia?.instagram} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, instagram: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold" placeholder="Instagram" />
                     <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, resellerWhatsApp: e.target.value}})} className="w-full bg-green-50/50 p-4 rounded-xl outline-none font-black text-green-600" placeholder="WhatsApp" />
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">📢 Announcement Bar</p>
                  <input value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="w-full bg-orange-50/50 p-5 rounded-2xl font-bold text-orange-600 text-center" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* POPUPS (Restored V2) */}
      <AnimatePresence>
         {isAddingSize && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md">
               <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xs text-center relative">
                  <h3 className="text-2xl font-black mb-8 uppercase italic">New Size</h3>
                  <input id="sz" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-black text-2xl text-center mb-8" placeholder="EX: 4Y" autoFocus />
                  <div className="flex gap-4">
                     <button onClick={()=>setIsAddingSize(null)} className="flex-1 font-black text-[10px] text-gray-400 uppercase">Abort</button>
                     <button onClick={()=>{ const v = (document.getElementById('sz') as HTMLInputElement).value; if(v){ setProducts(prev => prev.map(p=>p.id===isAddingSize?{...p, sizes:[...(p.sizes||[]), v.toUpperCase()], inventory:{...(p.inventory||{}), [v.toUpperCase()]:0} }:p)); setIsAddingSize(null); } }} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Add Size</button>
                  </div>
               </motion.div>
            </div>
         )}
         {isAddingCoupon && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md">
               <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-16 rounded-[4.5rem] shadow-2xl w-full max-w-2xl relative">
                  <h3 className="text-4xl font-black mb-12 uppercase italic text-center leading-none">New Voucher</h3>
                  <div className="space-y-6 mb-12">
                     <input id="ccode" className="w-full bg-gray-50 p-5 rounded-2xl font-black text-2xl uppercase tracking-widest outline-none" placeholder="CODE: GAKHA50" />
                     <div className="flex gap-6">
                        <input id="cval" type="number" className="flex-1 bg-gray-50 p-5 rounded-2xl font-black text-2xl outline-none" placeholder="Discount %" />
                        <input id="cexp" type="date" className="flex-1 bg-gray-50 p-5 rounded-2xl font-black outline-none" />
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={()=>setIsAddingCoupon(false)} className="flex-1 py-6 font-black uppercase text-gray-400">Abort</button>
                     <button onClick={()=>{ const c=(document.getElementById('ccode') as HTMLInputElement).value; const v=(document.getElementById('cval') as HTMLInputElement).value; const e=(document.getElementById('cexp') as HTMLInputElement).value; if(c && v){ supabase.from('coupons').insert([{id:Date.now(), code:c.toUpperCase(), value:parseInt(v), expiry_date:e||null}]).then(()=>{fetchData(); setIsAddingCoupon(false);}); } }} className="flex-1 bg-[var(--accent)] text-white py-6 rounded-[2rem] font-black uppercase shadow-2xl">Create</button>
                  </div>
               </motion.div>
            </div>
         )}
         {selectedOrder && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-3xl">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden relative">
                  <button onClick={()=>setSelectedOrder(null)} className="absolute top-8 right-8 p-5 bg-gray-100 rounded-3xl text-gray-400"><X className="w-6 h-6"/></button>
                  <div className="flex flex-col lg:flex-row min-h-[650px]">
                     <div className="flex-1 p-16 lg:p-24 overflow-y-auto custom-scrollbar">
                        <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 inline-block font-mono">Registry Details</span>
                        <h2 className="text-6xl font-black mb-16 tracking-tighter uppercase italic leading-none">{selectedOrder.customer_name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                           <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 flex gap-6">
                              <MapPin className="text-blue-600 w-8 h-8" /><div className="text-sm"><p className="font-black text-xl mb-2">{selectedOrder.city}</p><p className="text-gray-400">{selectedOrder.address}</p></div>
                           </div>
                           <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 flex gap-6">
                              <Phone className="text-green-500 w-8 h-8" /><div className="flex-1"><p className="font-black text-xl mb-4">{selectedOrder.whatsapp}</p><a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="bg-green-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg inline-block">WhatsApp Chat</a></div>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <input id="awb" value={selectedOrder.tracking_number} onChange={(e)=>setSelectedOrder({...selectedOrder, tracking_number:e.target.value})} className="flex-1 bg-gray-50 p-6 rounded-[2rem] outline-none font-black text-2xl shadow-inner" placeholder="AWB / NO RESI" />
                           <button onClick={()=>{ const a=(document.getElementById('awb') as HTMLInputElement).value; if(a){ supabase.from('orders').update({tracking_number:a, status:'Shipped'}).eq('id',selectedOrder.id).then(()=>{ handlePrintLabel(selectedOrder); fetchData(); setSelectedOrder(null); window.open(`https://wa.me/${selectedOrder.whatsapp}?text=${encodeURIComponent(`Halo ${selectedOrder.customer_name}, Paket Anda sedang dikirim dengan Resi: *${a}*.`)}`); }); } }} className="bg-blue-600 text-white px-10 rounded-[2rem] font-black uppercase text-xs shadow-2xl transition-all">Save & Notify WA</button>
                        </div>
                     </div>
                     <div className="w-full lg:w-[450px] bg-gray-950 text-white p-16 flex flex-col pt-24">
                        <h4 className="text-[10px] font-black uppercase text-gray-500 mb-10 tracking-[0.4em] italic leading-none">Cart Items</h4>
                        <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                           {selectedOrder.items?.map((it:any, i:number) => (
                             <div key={i} className="flex gap-6 items-center">
                                <img src={it.image} className="w-16 h-16 rounded-2xl object-cover shadow-2xl border border-white/5" />
                                <div><p className="text-xs font-black italic mb-2">{it.name}</p><p className="text-[9px] font-black uppercase text-[var(--accent)]">{it.size} x{it.quantity}</p></div>
                             </div>
                           ))}
                        </div>
                        <div className="pt-12 border-t border-white/10 mt-12">
                           <div className="flex justify-between items-end mb-10"><span className="text-[10px] font-black uppercase text-gray-500">Value</span><span className="text-4xl font-black text-[var(--accent)] tracking-tighter">Rp {selectedOrder.total.toLocaleString()}</span></div>
                           <button onClick={()=>{ supabase.from('orders').update({status:'Completed'}).eq('id',selectedOrder.id).then(()=>{fetchData(); setSelectedOrder(null);}); }} className="w-full bg-[var(--accent)] py-6 rounded-[2rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all">Selesaikan Pesanan</button>
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
