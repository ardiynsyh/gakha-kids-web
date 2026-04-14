import { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash, Settings, 
  Image as ImageIcon, Link as LinkIcon, Edit3, 
  LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck 
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
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
    setUser(user);
  };

  const refreshCoupons = async () => {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) {
       console.error("Error coupons:", error);
       return;
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const saveConfig = async () => {
    setIsLoading(true);
    const tid = toast.loading("Menyimpan konfigurasi...");
    try {
        const { error: cError } = await supabase.from('store_config').upsert({ id: 'main', config_data: config });
        if (cError) throw cError;
        
        if (infoPages.length > 0) {
           const { error: iError } = await supabase.from('info_pages').upsert(infoPages);
           if (iError) throw iError;
        }

        toast.success("Konfigurasi berhasil disimpan!", { id: tid });
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
    const tid = toast.loading("Mengunggah gambar...");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Berhasil diunggah!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Hapus produk ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
       setProducts(products.filter(p => p.id !== id));
       toast.success("Produk dihapus");
    }
  };

  const handleAddProduct = () => {
    const defaultCategory = config?.productCategories?.[0]?.id || 'born';
    const newProduct = {
      id: Date.now(),
      name: "Produk Baru",
      price: "Rp 0",
      image: "https://via.placeholder.com/300",
      linktreeUrl: "https://linktr.ee/",
      categories: [defaultCategory],
      sizes: ["S", "M", "L", "XL"],
      inventory: {},
      seoTitle: "",
      seoDescription: ""
    };
    setProducts([newProduct, ...products]);
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Menyinkronkan koleksi produk...");
    try {
      const formattedProducts = products.map(p => ({
        ...p,
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        inventory: p.inventory || {},
        categories: Array.isArray(p.categories) ? p.categories : []
      }));

      const { error: productsError } = await supabase.from('products').upsert(formattedProducts, { onConflict: 'id' });
      if (productsError) throw productsError;

      const { error: configError } = await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      if (configError) throw configError;

      toast.success("Berhasil! Semua data di Cloud kini ter-update.", { id: loadingToast });
    } catch (error: any) {
      toast.error("Gagal sinkron: " + error.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
      <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-[0.3em] text-[10px]">Verifikasi Akses Cloud...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-gray-900 text-white p-8 hidden md:flex flex-col flex-shrink-0 relative z-20">
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
            Gakha <span className="text-[var(--accent)]">Admin</span>
          </h2>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
            <ShieldCheck className="w-3 h-3" /> Cloud Protection Active
          </div>
        </div>

        <nav className="space-y-4 flex-1">
          {[
            { id: 'analytics', label: 'Dashboard & Analytics', icon: <Package className="w-5 h-5" /> },
            { id: 'products', label: 'Kelola Produk', icon: <Package className="w-5 h-5" /> },
            { id: 'orders', label: 'Pesanan Masuk', icon: <ShoppingBag className="w-5 h-5" /> },
            { id: 'coupons', label: 'Kupon & Promo', icon: <Zap className="w-5 h-5" /> },
            { id: 'resellers', label: 'Database Reseller', icon: <User className="w-5 h-5" /> },
            { id: 'settings', label: 'Pengaturan Toko', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
              {tab.icon} <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.email}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Administrator</p>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-left p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-5 h-5" /> <span className="font-bold">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 h-screen overflow-y-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="products" className="max-w-[1400px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Database Produk</h1>
                  <p className="text-gray-500 mt-1">Status: <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Live On Cloud</span></p>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleAddProduct} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm shadow-sm transition-all active:scale-95"><Plus className="w-5 h-5" /> Tambah</button>
                  <button onClick={handlePushAllToCloud} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">🚀 Push ke Cloud</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
                      <th className="p-6">Foto</th>
                      <th className="p-6">Nama Produk</th>
                      <th className="p-6">Harga</th>
                      <th className="p-6">Ukuran & Stok</th>
                      <th className="p-6">SEO Metadata</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-6">
                           <div className="relative group w-14 h-14">
                              <img src={p.image} className="w-full h-full object-cover rounded-xl shadow-sm" />
                              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer rounded-xl transition-opacity">
                                 <Plus className="w-4 h-4 text-white" />
                                 <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url))} />
                              </label>
                           </div>
                        </td>
                        <td className="p-6">
                          <input type="text" value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full font-bold text-sm bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)]" />
                          <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">ID: {p.id}</p>
                        </td>
                        <td className="p-6">
                          <input type="text" value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="font-bold text-blue-600 text-sm bg-transparent outline-none border-b border-transparent focus:border-[var(--accent)]" />
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-3 max-w-[300px]">
                             {(p.sizes || []).map((s: string) => (
                               <div key={s} className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col items-center">
                                  <span className="text-[8px] font-black text-gray-400 mb-1">{s}</span>
                                  <input 
                                    type="number" 
                                    value={p.inventory?.[s] || 0}
                                    onChange={(e) => {
                                       const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                       handleUpdateProduct(p.id, 'inventory', inv);
                                    }}
                                    className="w-10 bg-white border border-gray-200 rounded text-center font-bold text-[10px]"
                                  />
                               </div>
                             ))}
                          </div>
                        </td>
                        <td className="p-6 space-y-2">
                           <input placeholder="SEO Title" value={p.seoTitle || ''} onChange={(e) => handleUpdateProduct(p.id, 'seoTitle', e.target.value)} className="w-full text-[10px] bg-gray-50 border border-gray-100 rounded p-1.5" />
                           <textarea placeholder="SEO Description" value={p.seoDescription || ''} onChange={(e) => handleUpdateProduct(p.id, 'seoDescription', e.target.value)} className="w-full text-[10px] bg-gray-50 border border-gray-100 rounded p-1.5 h-10 resize-none" />
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleDelete(p.id)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="analytics" className="max-w-[1200px]">
                <div className="mb-10">
                  <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-3">Shop Performance</h1>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Real-time Insight Gakha Kids</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: "Omzet (Pendapatan)", val: `Rp ${orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}`, icon: <Package className="w-5 h-5 text-green-500" /> },
                     { label: "Jumlah Pesanan", val: orders.length.toString(), icon: <ShoppingBag className="w-5 h-5 text-blue-500" /> },
                     { label: "Produk Terdaftar", val: products.length.toString(), icon: <Zap className="w-5 h-5 text-yellow-500" /> },
                     { label: "Kupon Aktif", val: coupons.length.toString(), icon: <Edit3 className="w-5 h-5 text-purple-500" /> },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">{stat.icon}</div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.val}</h3>
                     </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'settings' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="settings" className="max-w-[1000px] pb-32">
                <div className="flex justify-between items-center mb-10">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pengaturan Toko</h1>
                  <button onClick={saveConfig} disabled={isLoading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 hover:bg-black transition-all">
                     <Save className="w-5 h-5" /> {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                   <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-3">📢 Top Announcement Bar</h2>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setConfig({...config, announcement: {...config.announcement, isEnabled: !config.announcement.isEnabled}})} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase border ${config.announcement?.isEnabled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                            {config.announcement?.isEnabled ? 'Aktif' : 'Non-Aktif'}
                         </button>
                         <input type="text" value={config.announcement?.text || ''} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-[var(--accent)]" placeholder="Contoh: Gratis Ongkir Seluruh Indonesia!" />
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><ImageIcon className="w-5 h-5 text-purple-500" /> Hero Section Banner</h2>
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Heading Line 1" value={config.hero?.headingLine1 || ''} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                            <input placeholder="Heading Line 2 (Aksen)" value={config.hero?.headingLine2 || ''} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[var(--accent)] font-bold" />
                         </div>
                         <textarea placeholder="Deskripsi Hero" value={config.hero?.description || ''} onChange={(e) => setConfig({...config, hero: {...config.hero, description: e.target.value}})} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 h-24 resize-none" />
                         <div className="flex gap-4">
                            <input placeholder="URL Background Image" value={config.hero?.backgroundImage || ''} onChange={(e) => setConfig({...config, hero: {...config.hero, backgroundImage: e.target.value}})} className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-xs" />
                            <label className="bg-white border-2 border-dashed border-gray-200 px-6 py-2 rounded-xl text-xs font-bold cursor-pointer hover:border-[var(--accent)] flex items-center">
                               Pilih Foto
                               <input type="file" className="hidden" onChange={(e) => e.target.files && handleUploadImage(e.target.files[0], (url) => setConfig({...config, hero: {...config.hero, backgroundImage: url}}))} />
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h2 className="text-xl font-bold mb-6">📱 Media Sosial & Kontak</h2>
                      <div className="grid grid-cols-2 gap-6">
                         {['instagram', 'tiktok', 'resellerWhatsApp', 'facebook'].map(plat => (
                            <div key={plat}>
                               <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">{plat}</label>
                               <input type="text" value={config.socialMedia?.[plat] || ''} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, [plat]: e.target.value}})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-xs" />
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h2 className="text-xl font-bold mb-6">📝 Halaman Informasi (About/FAQ)</h2>
                      <div className="space-y-6">
                         {infoPages.map((page, idx) => (
                           <div key={page.id} className="pt-6 border-t border-gray-50 first:border-0 first:pt-0">
                             <div className="font-black text-[10px] text-gray-300 mb-2">PAGE: {page.id}</div>
                             <input value={page.title || ''} onChange={(e) => {
                               const newPages = [...infoPages];
                               newPages[idx].title = e.target.value;
                               setInfoPages(newPages);
                             }} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 font-bold mb-3" />
                             <textarea value={page.content || ''} onChange={(e) => {
                               const newPages = [...infoPages];
                               newPages[idx].content = e.target.value;
                               setInfoPages(newPages);
                             }} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 h-32 text-sm" />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'resellers' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="resellers" className="max-w-[1200px]">
                <div className="flex justify-between items-center mb-8">
                   <h1 className="text-3xl font-black text-gray-900 tracking-tighter">DATABASE RESELLER</h1>
                   <button onClick={async () => {
                     const name = prompt('Nama Partner:');
                     if (name) {
                        const newRes = { name, city: '', whatsapp: '', status: 'Active' };
                        const { data, error } = await supabase.from('resellers').insert([newRes]).select();
                        if (data) setResellers([data[0], ...resellers]);
                     }
                   }} className="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all"><Plus className="w-5 h-5" /> Tambah Partner</button>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50/50">
                         <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Partner</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Lokasi</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">WhatsApp</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                            <th className="p-6"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {resellers.map((res, idx) => (
                            <tr key={res.id}>
                               <td className="p-6 font-bold">{res.name}</td>
                               <td className="p-6"><input value={res.city || ''} onChange={(e) => {
                                 const updated = [...resellers];
                                 updated[idx].city = e.target.value;
                                 setResellers(updated);
                               }} className="bg-transparent outline-none border-b border-gray-100 focus:border-[var(--accent)]" /></td>
                               <td className="p-6 font-mono text-sm">{res.whatsapp}</td>
                               <td className="p-6">
                                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{res.status}</span>
                               </td>
                               <td className="p-6 text-right space-x-2">
                                  <button onClick={async () => {
                                     await supabase.from('resellers').upsert(res);
                                     toast.success("Tersimpan");
                                  }} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Save className="w-4 h-4" /></button>
                                  <button onClick={async () => {
                                     if(confirm('Hapus?')){
                                        await supabase.from('resellers').delete().eq('id', res.id);
                                        setResellers(resellers.filter(r => r.id !== res.id));
                                     }
                                  }} className="p-2 text-red-300 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}

          {activeTab === 'coupons' && (
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key="coupons" className="max-w-[1200px]">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Promotion Engine</h1>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Kelola voucher diskon pelanggan</p>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => {
                           const tid = toast.loading("Sinkronisasi kupon...");
                           refreshCoupons().then(() => toast.success("Data terbaru ditarik!", { id: tid }));
                        }}
                        className="bg-white border border-gray-200 text-gray-600 px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                         <Clock className="w-4 h-4" /> Sync Data
                      </button>
                      <button 
                        onClick={async () => {
                           const code = prompt('Masukkan Kode Voucher:');
                           if (!code) return;
                           
                           const valueStr = prompt('Berapa persen diskonnya? (1-100):');
                           const value = parseInt(valueStr || '10');
                           
                           if (isNaN(value)) {
                              toast.error("Diskon harus angka!");
                              return;
                           }

                           const tid = toast.loading("Memproses...");
                           try {
                              const newC = { 
                                 id: Date.now(),
                                 code: code.toUpperCase().trim(), 
                                 discount_type: 'Percentage', 
                                 value: value, 
                                 status: 'Active' 
                              };
                              
                              const { error } = await supabase.from('coupons').insert([newC]);
                              
                              if (error) throw error;
                              
                              await refreshCoupons();
                              toast.success(`Kupon ${newC.code} aktif!`, { id: tid });
                           } catch (err: any) {
                              toast.error("Gagal: " + err.message, { id: tid });
                           }
                        }} 
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                      >
                         <Plus className="w-5 h-5 text-[var(--accent)]" /> Buat Kupon Baru
                      </button>
                   </div>
                </div>

                {coupons.length === 0 ? (
                   <div className="bg-white border-4 border-dashed border-gray-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center">
                      <Zap className="w-16 h-16 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Belum ada kupon aktif</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {coupons.map(c => (
                         <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-between hover:border-[var(--accent)] transition-all group">
                            <div>
                               <div className="bg-gray-900 text-white px-5 py-2 rounded-xl font-mono font-bold text-xl mb-3 tracking-tighter inline-block shadow-lg">
                                  {c.code}
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">Diskon {c.value}%</span>
                                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Status: {c.status}</span>
                               </div>
                            </div>
                            <button 
                              onClick={async () => {
                                 if(!confirm(`Hapus kupon ${c.code}?`)) return;
                                 const tid = toast.loading("Menghapus...");
                                 const { error } = await supabase.from('coupons').delete().eq('id', c.id);
                                 if (!error) {
                                    setCoupons(coupons.filter(cp => cp.id !== c.id));
                                    toast.success("Kupon dihapus", { id: tid });
                                 } else {
                                    toast.error("Gagal hapus", { id: tid });
                                 }
                              }} 
                              className="p-4 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                            >
                               <Trash className="w-6 h-6" />
                            </button>
                         </div>
                      ))}
                   </div>
                )}
             </motion.div>
          )}

          {activeTab === 'orders' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders" className="max-w-[1200px]">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-10">ORDER REGISTRY</h1>
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50">
                         <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Order ID</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Nama Pelanggan</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Bayar</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {orders.map(ord => (
                            <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                               <td className="p-6 font-mono font-bold text-blue-600">ORD-{ord.id}</td>
                               <td className="p-6 font-bold">{ord.customer_name}</td>
                               <td className="p-6 font-black">Rp {(ord.total || 0).toLocaleString()}</td>
                               <td className="p-6">
                                  <span className="bg-amber-50 text-amber-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{ord.status}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
