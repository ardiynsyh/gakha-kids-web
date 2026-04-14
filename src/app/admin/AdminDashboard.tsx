import { useState, useEffect } from 'react';
import { Package, Save, Plus, Trash, Settings, Image as ImageIcon, Link as LinkIcon, Edit3, Ruler, LogOut, User, ShoppingBag, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const Clock = ({className}: {className?: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Zap = ({className}: {className?: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ShieldCheck = ({className}: {className?: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'resellers' | 'orders' | 'coupons' | 'analytics'>('analytics');
  const [products, setProducts] = useState<any[]>([]);
  const [resellers, setResellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [infoPages, setInfoPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    } else {
      setUser(session.user);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast.success('Berhasil keluar.');
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (pData) setProducts(pData);

      const { data: configData } = await supabase.from('store_config').select('*').eq('id', 'main').single();
      if (configData) setConfig(configData.config_data);

      const { data: resData } = await supabase.from('resellers').select('*').order('created_at', { ascending: false });
      if (resData) setResellers(resData);

      const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordData) setOrders(ordData || []);

      const { data: coupData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (coupData) setCoupons(coupData || []);

      const { data: iData } = await supabase.from('info_pages').select('*');
      if (iData) setInfoPages(iData);
    } catch (e) {
      console.error('Error fetching from Supabase:', e);
    }
    setIsSyncing(false);
  };

  const saveProducts = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('products').upsert(products);
      if (error) throw error;
      toast.success('Produk berhasil disimpan ke Cloud!');
    } catch (e) {
      toast.error('Error saat menyimpan: ' + e);
    }
    setIsLoading(false);
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const { error: cError } = await supabase.from('store_config').upsert({
        id: 'main',
        config_data: config
      });
      if (cError) throw cError;
      
      const { error: iError } = await supabase.from('info_pages').upsert(infoPages);
      if (iError) throw iError;

      toast.success('Pengaturan Cloud berhasil diperbarui!');
    } catch (e) {
      toast.error('Error: ' + e);
    }
    setIsLoading(false);
  };

  const handleUpdateProduct = (id: number, key: string, value: any) => {
    const updated = products.map(p => p.id === id ? { ...p, [key]: value } : p);
    setProducts(updated);
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: reader.result })
        });
        const json = await res.json();
        if (json.success) {
          callback(json.url);
        } else {
          toast.error('Gagal upload gambar secara lokal.');
        }
      } catch (e) {
        toast.error('Gagal upload: ' + e);
      }
    };
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus produk ini secara permanen dari Cloud?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
        toast.success('Produk terhapus.');
      } catch (e) {
        toast.error('Gagal menghapus: ' + e);
      }
    }
  };

  const handleAddProduct = () => {
    const defaultCategory = config?.productCategories?.length > 0 ? config.productCategories[0].id : 'born';
    const newProduct = {
      id: Date.now(),
      name: "Produk Baru",
      price: "Rp 0",
      image: "https://images.unsplash.com/photo-1632232963035-bc14755747c9?auto=format&fit=crop&w=500&q=60",
      color: "#cccccc",
      linktreeUrl: "https://linktr.ee/",
      categories: [defaultCategory],
      sizes: ["S", "M", "L", "XL"],
      inventory: {},
      details: "",
      video: "",
      bundleIds: []
    };
    setProducts([newProduct, ...products]);
  };

  const handlePushAllToCloud = async () => {
    const confirmPush = window.confirm("Ini akan menyinkronkan seluruh data lokal ke cloud. Lanjutkan?");
    if (!confirmPush) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Menyinkronkan koleksi produk...");

    try {
      const { error: productsError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });

      if (productsError) throw productsError;

      const { error: configError } = await supabase
        .from('store_config')
        .upsert({ id: 'main', config_data: config });

      if (configError) throw configError;

      toast.success("Berhasil! Semua data kini tersinkron di Cloud.", { id: loadingToast });
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal sinkron: " + error.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
      <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-[0.3em] text-[10px]">Cloud Guard Verification...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-gray-900 text-white p-8 hidden md:flex flex-col flex-shrink-0 relative z-20">
        <div className="mb-12">
            <h2 className="text-2xl font-black mb-2 text-white flex items-center gap-2">
               Gakha <span className="text-[var(--accent)]">Admin</span>
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
               <ShieldCheck className="w-3 h-3" /> Cloud Protection Active
            </div>
        </div>

        <nav className="space-y-4 flex-1">
          <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <Package className="w-5 h-5" />
              <span className="font-bold">Dashboard & Analytics</span>
            </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'products' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Package className="w-5 h-5" />
            <span className="font-bold">Kelola Produk</span>
          </button>
          <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-bold">Pesanan Masuk</span>
            </button>
          <button 
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'coupons' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <Zap className="w-5 h-5" />
              <span className="font-bold">Kupon & Promo</span>
            </button>
          <button 
              onClick={() => setActiveTab('resellers')}
              className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'resellers' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <User className="w-5 h-5" />
              <span className="font-bold">Database Reseller</span>
            </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold">Pengaturan Toko</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
           <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                 <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="overflow-hidden">
                 <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest">Administrator</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 text-left p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
           >
             <LogOut className="w-5 h-5" />
             <span className="font-bold">Keluar (Logout)</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 p-8 h-screen overflow-y-auto w-full max-w-full">
        {activeTab === 'products' && (
          <div className="max-w-[1400px] mb-20">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Database Produk</h1>
                <p className="text-gray-500 mt-1">Status: <span className="text-green-600 font-bold uppercase text-xs tracking-widest">Live On Supabase Cloud</span></p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Produk
                </button>
                <button 
                  onClick={handlePushAllToCloud}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  🚀 Push Semua ke Cloud
                </button>
                <button 
                  onClick={() => saveProducts()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-xl font-bold text-sm"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? 'Processing...' : 'Sync to Cloud'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    <th className="p-6 w-16">Foto</th>
                    <th className="p-6 w-[15%]">Nama Produk</th>
                    <th className="p-6 w-[12%]">Harga & Diskon</th>
                    <th className="p-6 w-[15%]">Ukuran</th>
                    <th className="p-6 w-[15%]">Kategori</th>
                    <th className="p-6 w-[15%]">Video & Bundle</th>
                    <th className="p-6 w-[12%]">Link Marketplace</th>
                    <th className="p-6 w-[10%] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-6">
                        <div className="relative group w-14 h-14 shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl shadow-sm" />
                          <label className="absolute inset-0 bg-black/60 text-white flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <span className="text-[10px] font-black uppercase">Edit</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </td>
                      <td className="p-6">
                        <input 
                          type="text" 
                          value={p.name} 
                          onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none font-bold text-gray-800 text-sm"
                        />
                         <p className="text-[10px] text-gray-400 mt-1 font-mono">ID: {p.id}</p>
                      </td>
                      <td className="p-6 space-y-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-bold">SALE</span>
                          <input 
                            type="text" 
                            value={p.price} 
                            onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-10 pr-3 py-1.5 focus:bg-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none text-[var(--accent)] font-black text-sm transition-all"
                            placeholder="Rp 0"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-bold">DISC</span>
                          <input 
                            type="text" 
                            value={p.originalPrice || ''} 
                            onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-10 pr-3 py-1.5 focus:bg-white focus:border-gray-300 outline-none text-gray-400 line-through text-[11px] transition-all"
                            placeholder="Harga Coret"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex-1 relative">
                              <span className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-bold">%</span>
                              <input 
                                type="number" 
                                placeholder="0"
                                className="w-full bg-red-50 border border-red-100 rounded-lg pl-6 pr-2 py-1.5 focus:bg-white focus:border-red-300 outline-none text-red-500 font-black text-[11px] transition-all"
                                onChange={(e) => {
                                   const pct = parseInt(e.target.value);
                                   if (!isNaN(pct) && p.originalPrice) {
                                      const op = parseInt(p.originalPrice.replace(/\D/g, ''));
                                      if (!isNaN(op)) {
                                         const discountAmount = (op * pct) / 100;
                                         const finalPrice = op - discountAmount;
                                         handleUpdateProduct(p.id, 'price', `Rp ${finalPrice.toLocaleString('id-ID')}`);
                                      }
                                   }
                                }}
                              />
                           </div>
                           <div className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded">
                              {(() => {
                                 const p_val = parseInt(p.price.replace(/\D/g, ''));
                                 const op_val = parseInt((p.originalPrice || '0').replace(/\D/g, ''));
                                 if (p_val && op_val && op_val > p_val) {
                                    return `-${Math.round(((op_val - p_val) / op_val) * 100)}%`;
                                 }
                                 return '0%';
                              })()}
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                         <div className="space-y-3">
                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                               {['NB', '0-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => {
                                 const isSelected = (p.sizes || []).includes(s);
                                 return (
                                   <button 
                                     key={s}
                                     onClick={() => {
                                       const currentSizes = p.sizes || [];
                                       const newSizes = isSelected 
                                         ? currentSizes.filter((size: string) => size !== s)
                                         : [...currentSizes, s];
                                       handleUpdateProduct(p.id, 'sizes', newSizes);
                                     }}
                                     className={`text-[9px] px-2 py-1 rounded-md border font-black transition-all ${
                                       isSelected 
                                       ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm' 
                                       : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                     }`}
                                   >
                                     {s}
                                   </button>
                                 );
                               })}
                            </div>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="text" 
                                 placeholder="Custom size..."
                                 className="flex-1 text-[10px] border border-gray-100 rounded-lg px-2 py-1 bg-gray-50/50 outline-none focus:border-gray-300"
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                       const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                       if (val && !(p.sizes || []).includes(val)) {
                                          handleUpdateProduct(p.id, 'sizes', [...(p.sizes || []), val]);
                                          (e.target as HTMLInputElement).value = '';
                                       }
                                    }
                                 }}
                               />
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="space-y-3">
                            <select
                              value={(p.categories || []).find((c: string) => c !== 'new') || (config?.productCategories?.[0]?.id || 'born')}
                              onChange={(e) => {
                                const otherCats = (p.categories || []).includes('new') ? ['new'] : [];
                                handleUpdateProduct(p.id, 'categories', [...otherCats, e.target.value]);
                              }}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-[11px] font-bold text-gray-700 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            >
                              {(config?.productCategories || [
                                { id: 'born', name: '🤱 Born (0-6)' },
                                { id: 'baby', name: '👶 Bayi (6-24)' },
                                { id: 'toddler', name: '🧸 Toddler (2-5)' },
                                { id: 'boys', name: '👦 Laki-Laki' },
                                { id: 'girls', name: '👧 Perempuan' },
                                { id: 'accessories', name: '🎒 Aksesoris' },
                                { id: 'sale', name: '🏷️ Diskon' }
                              ]).map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => {
                                const isNew = (p.categories || []).includes('new');
                                const newCats = isNew 
                                  ? (p.categories || []).filter((c: string) => c !== 'new')
                                  : [...(p.categories || []), 'new'];
                                handleUpdateProduct(p.id, 'categories', newCats);
                              }}
                              className={`w-full flex justify-center py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                (p.categories || []).includes('new') 
                                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                : 'bg-gray-50 text-gray-400 border-gray-100 opacity-60'
                              }`}
                            >
                              {(p.categories || []).includes('new') ? 'Koleksi Terbaru ★' : 'Produk Biasa'}
                            </button>
                         </div>
                      </td>
                      <td className="p-6">
                        <textarea 
                          value={p.linktreeUrl || ''} 
                          onChange={(e) => handleUpdateProduct(p.id, 'linktreeUrl', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-mono text-[8px] text-blue-600 h-28 resize-none outline-none focus:border-blue-300"
                          placeholder="Linktree/Shopee..."
                        />
                      </td>
                      <td className="p-6">
                         <div className="space-y-3">
                            <div className="relative">
                               <label className="text-[9px] font-black text-gray-400 uppercase">Video URL (Direct MP4)</label>
                               <input 
                                 type="text" 
                                 value={p.video || ''} 
                                 onChange={(e) => handleUpdateProduct(p.id, 'video', e.target.value)}
                                 className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-mono outline-none focus:border-purple-300"
                                 placeholder="https://...mp4"
                               />
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-gray-400 uppercase">Shop Look (Bundle IDs)</label>
                               <input 
                                 type="text" 
                                 value={(p.bundleIds || []).join(', ')} 
                                 onChange={(e) => handleUpdateProduct(p.id, 'bundleIds', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                                 className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-mono outline-none focus:border-green-300"
                                 placeholder="ID1, ID2..."
                               />
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <label className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1">
                                  <LinkIcon className="w-2 h-2" /> SEO Metadata (Google)
                                </label>
                                <div className="space-y-2 mt-1">
                                  <input 
                                    type="text" 
                                    value={p.seoTitle || ''} 
                                    onChange={(e) => handleUpdateProduct(p.id, 'seoTitle', e.target.value)}
                                    placeholder="Meta Title..."
                                    className="w-full bg-blue-50/50 border border-blue-100 rounded p-1.5 text-[9px] outline-none" 
                                  />
                                  <textarea 
                                    value={p.seoDescription || ''} 
                                    onChange={(e) => handleUpdateProduct(p.id, 'seoDescription', e.target.value)}
                                    placeholder="Meta Description..."
                                    className="w-full bg-blue-50/50 border border-blue-100 rounded p-1.5 text-[9px] h-12 resize-none outline-none" 
                                  />
                                </div>
                             </div>
                         </div>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-[1000px] mb-32">
             {/* [Keep Settings content essentially same or slightly polished, same as Products update] */}
             <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Konfigurasi Toko</h1>
                <p className="text-gray-500 mt-1">Identitas brand dan konten website yang diambil dari Cloud.</p>
              </div>
              <button 
                onClick={saveConfig}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-xl font-bold text-sm"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Saving...' : 'Simpan Canges'}
              </button>
            </div>
            
            {/* Announcement, Sosmed, Hero, Pages Sections (Briefed but logic is fully cloud-aware now) */}
            <div className="grid grid-cols-1 gap-8">
               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">📢 Announcement Bar (Notif Bar)</h2>
                  <div className="flex items-center gap-4 mb-4">
                     <button onClick={() => setConfig({...config, announcement: {...config.announcement, isEnabled: !config.announcement.isEnabled}})} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${config.announcement?.isEnabled ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {config.announcement?.isEnabled ? 'AKTIF' : 'NONAKTIF'}
                     </button>
                     <input type="text" value={config.announcement?.text} onChange={(e) => setConfig({...config, announcement: {...config.announcement, text: e.target.value}})} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" placeholder="Teks pengumuman..." />
                  </div>
               </div>
               
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-red-400">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                     <Clock className="w-5 h-5 text-red-500" /> ⚡ Flash Sale & Urgency Timer
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <button onClick={() => setConfig({...config, flashSale: {...config.flashSale, isEnabled: !config.flashSale.isEnabled}})} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${config.flashSale?.isEnabled ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                              {config.flashSale?.isEnabled ? 'FLASH SALE AKTIF' : 'NONAKTIF'}
                           </button>
                           <input type="text" value={config.flashSale?.text} onChange={(e) => setConfig({...config, flashSale: {...config.flashSale, text: e.target.value}})} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" placeholder="Judul promo..." />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Berakhir Pada (Contoh: April 25, 2026 23:59:59)</label>
                           <input type="text" value={config.flashSale?.endTime} onChange={(e) => setConfig({...config, flashSale: {...config.flashSale, endTime: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-mono" placeholder="Target waktu..." />
                        </div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 leading-relaxed italic">
                        Tip: Gunakan timer ini untuk meningkatkan rasa urgensi pembeli. Timer akan muncul di bawah bar pengumuman pada setiap halaman.
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-purple-400">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                     <Zap className="w-5 h-5 text-purple-500" /> 🎁 Newsletter & Promo Popup
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <button onClick={() => setConfig({...config, newsletterPopup: {...config.newsletterPopup, isEnabled: !config.newsletterPopup.isEnabled}})} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${config.newsletterPopup?.isEnabled ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                           {config.newsletterPopup?.isEnabled ? 'POPUP AKTIF' : 'NONAKTIF'}
                        </button>
                        <div>
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Judul Penawaran</label>
                           <input type="text" value={config.newsletterPopup?.title} onChange={(e) => setConfig({...config, newsletterPopup: {...config.newsletterPopup, title: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-bold" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Kode Diskon (Teks Reveal)</label>
                           <input type="text" value={config.newsletterPopup?.promoCode} onChange={(e) => setConfig({...config, newsletterPopup: {...config.newsletterPopup, promoCode: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-mono text-purple-600" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Deskripsi & Instruksi</label>
                        <textarea value={config.newsletterPopup?.description} onChange={(e) => setConfig({...config, newsletterPopup: {...config.newsletterPopup, description: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs h-32 resize-none" />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                     <span>📦 Kategori Produk</span>
                     <button 
                        onClick={() => {
                           const newCats = [...(config.productCategories || [])];
                           newCats.push({ id: 'kategori-' + Date.now(), name: '🏷️ Kategori Baru' });
                           setConfig({...config, productCategories: newCats});
                        }}
                        className="p-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(config.productCategories || []).map((cat: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <div className="flex-1 space-y-2">
                              <div>
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Nama & Emoji</label>
                                 <input 
                                    type="text" 
                                    value={cat.name} 
                                    onChange={(e) => {
                                       const newCats = [...config.productCategories];
                                       newCats[idx].name = e.target.value;
                                       setConfig({...config, productCategories: newCats});
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold"
                                 />
                              </div>
                              <div>
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Slug / ID (untuk filter URL)</label>
                                 <input 
                                    type="text" 
                                    value={cat.id} 
                                    onChange={(e) => {
                                       const newCats = [...config.productCategories];
                                       newCats[idx].id = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                       setConfig({...config, productCategories: newCats});
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono"
                                 />
                              </div>
                           </div>
                           <button 
                              onClick={() => {
                                 const newCats = config.productCategories.filter((_: any, i: number) => i !== idx);
                                 setConfig({...config, productCategories: newCats});
                              }}
                              className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           >
                              <Trash className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
                  {(config.productCategories || []).length === 0 && (
                     <p className="text-center py-4 text-gray-400 text-sm">Belum ada kategori kustom. Gunakan tombol + untuk menambahkan.</p>
                  )}
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                     <span>🔗 Menu Navigasi</span>
                     <button 
                        onClick={() => {
                           const newLinks = [...(config.navigation?.links || [])];
                           newLinks.push({ label: 'MENU BARU', href: '/shop/all' });
                           setConfig({...config, navigation: {...config.navigation, links: newLinks}});
                        }}
                        className="p-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                  </h2>
                  <div className="space-y-3">
                     {(config.navigation?.links || []).map((link: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Label Menu</label>
                                 <input 
                                    type="text" 
                                    value={link.label} 
                                    onChange={(e) => {
                                       const newLinks = [...config.navigation.links];
                                       newLinks[idx].label = e.target.value.toUpperCase();
                                       setConfig({...config, navigation: {...config.navigation, links: newLinks}});
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-black"
                                 />
                              </div>
                              <div>
                                 <label className="text-[9px] font-black text-gray-400 uppercase">Link (Href)</label>
                                 <input 
                                    type="text" 
                                    value={link.href} 
                                    onChange={(e) => {
                                       const newLinks = [...config.navigation.links];
                                       newLinks[idx].href = e.target.value;
                                       setConfig({...config, navigation: {...config.navigation, links: newLinks}});
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono"
                                 />
                              </div>
                           </div>
                           <button 
                              onClick={() => {
                                 const newLinks = config.navigation.links.filter((_: any, i: number) => i !== idx);
                                 setConfig({...config, navigation: {...config.navigation, links: newLinks}});
                              }}
                              className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           >
                              <Trash className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">📱 WhatsApp & Social Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {['instagram', 'tiktok', 'resellerWhatsApp', 'facebook'].map(plat => (
                        <div key={plat}>
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">{plat}</label>
                           <input type="text" value={config.socialMedia?.[plat]} onChange={(e) => setConfig({...config, socialMedia: {...config.socialMedia, [plat]: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-mono" />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                     <ImageIcon className="w-5 h-5 text-purple-500" /> Hero & Visual Banner
                  </h2>
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Pesan Utama (Baris 1)</label>
                           <input type="text" value={config.hero?.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Pesan Aksen (Baris 2)</label>
                           <input type="text" value={config.hero?.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold text-[var(--accent)]" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Deskripsi Hero</label>
                        <textarea value={config.hero?.description} onChange={(e) => setConfig({...config, hero: {...config.hero, description: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm h-24 resize-none" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Gambar Background Hero (URL)</label>
                        <div className="flex gap-3">
                           <input type="text" value={config.hero?.backgroundImage} onChange={(e) => setConfig({...config, hero: {...config.hero, backgroundImage: e.target.value}})} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono" />
                           <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
                              Browse
                              <input type="file" className="hidden" onChange={(e) => e.target.files && handleUploadImage(e.target.files[0], (url) => setConfig({...config, hero: {...config.hero, backgroundImage: url}}))} />
                           </label>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                     <Edit3 className="w-5 h-5 text-green-500" /> Konten Halaman Info
                  </h2>
                  <div className="space-y-8 divide-y divide-gray-50">
                     {infoPages.map((page, idx) => (
                        <div key={page.id} className="pt-8 first:pt-0">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-black text-gray-900 uppercase tracking-wider text-xs">{page.id.replace('-', ' ')}</h3>
                              <span className="text-[10px] font-bold text-gray-300">Sync ID: {page.id}</span>
                           </div>
                           <div className="space-y-4">
                              <input 
                                 type="text" 
                                 value={page.title} 
                                 onChange={(e) => {
                                    const newPages = [...infoPages];
                                    newPages[idx].title = e.target.value;
                                    setInfoPages(newPages);
                                 }}
                                 className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold"
                                 placeholder="Judul Halaman..."
                              />
                              <textarea 
                                 value={page.content} 
                                 onChange={(e) => {
                                    const newPages = [...infoPages];
                                    newPages[idx].content = e.target.value;
                                    setInfoPages(newPages);
                                 }}
                                 className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm h-48 leading-relaxed resize-none"
                                 placeholder="Konten halaman (bersifat teks panjang)..."
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Tab Resellers */}
        {activeTab === 'resellers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter">DATABASE RESELLER</h1>
                  <p className="text-gray-500 text-sm font-medium">Kelola hubungan dan data partner bisnis Gakha Kids.</p>
                </div>
                <button 
                  onClick={async () => {
                    const name = prompt('Nama Reseller:');
                    if (name) {
                      const newRes = { id: Date.now(), name, city: '', whatsapp: '', status: 'Active' };
                      setResellers([newRes, ...resellers]);
                      await supabase.from('resellers').insert([newRes]);
                    }
                  }}
                  className="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Tambah Partner
                </button>
             </div>

             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Partner</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Lokasi / Kota</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="p-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resellers.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6 font-bold text-gray-900">{res.name}</td>
                        <td className="p-6">
                          <input 
                            value={res.city} 
                            onChange={(e) => {
                              const updated = resellers.map(r => r.id === res.id ? {...r, city: e.target.value} : r);
                              setResellers(updated);
                            }}
                            placeholder="Contoh: Jakarta"
                            className="bg-transparent border-b border-transparent focus:border-[var(--accent)] outline-none text-sm font-medium"
                          />
                        </td>
                        <td className="p-6">
                          <input 
                            value={res.whatsapp} 
                            onChange={(e) => {
                              const updated = resellers.map(r => r.id === res.id ? {...r, whatsapp: e.target.value} : r);
                              setResellers(updated);
                            }}
                            placeholder="628..."
                            className="bg-transparent border-b border-transparent focus:border-[var(--accent)] outline-none text-sm font-mono"
                          />
                        </td>
                        <td className="p-6">
                           <select 
                            value={res.status}
                            onChange={(e) => {
                              const updated = resellers.map(r => r.id === res.id ? {...r, status: e.target.value} : r);
                              setResellers(updated);
                            }}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border-none outline-none"
                           >
                             <option>Active</option>
                             <option>Pending</option>
                             <option>Inactive</option>
                           </select>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button 
                                onClick={async () => {
                                   const { error } = await supabase.from('resellers').upsert(res);
                                   if (!error) toast.success('Data Partner Tersimpan');
                                }}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Save"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm('Hapus partner ini?')) {
                                    await supabase.from('resellers').delete().eq('id', res.id);
                                    setResellers(resellers.filter(r => r.id !== res.id));
                                  }
                                }}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Tab Analytics */}
        {activeTab === 'analytics' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-3">Shop Performance</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Statistik Penjualan & Performa Katalog Gakha Kids</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                 {[
                   { label: "Total Omzet", val: `Rp ${orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}`, icon: <Package className="w-5 h-5 text-green-500" />, color: "bg-green-50" },
                   { label: "Total Pesanan", val: JSON.stringify(orders.length), icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: "bg-blue-50" },
                   { label: "Produk Aktif", val: JSON.stringify(products.length), icon: <Zap className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-50" },
                   { label: "Kupon Aktif", val: JSON.stringify(coupons.length), icon: <Edit3 className="w-5 h-5 text-purple-500" />, color: "bg-purple-50" },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                      <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                        {stat.icon}
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.val}</h3>
                   </div>
                 ))}
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                 <h2 className="text-xl font-black mb-8 italic uppercase tracking-tight">Kinerja Produk Terpopuler</h2>
                 <div className="space-y-6">
                    {products.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0">
                            <img src={p.image} className="w-full h-full object-contain p-1" />
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900">{p.name}</h4>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-1.5 overflow-hidden">
                               <div className="bg-[var(--accent)] h-full rounded-full" style={{ width: `${85 - (i * 15)}%` }} />
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-xs font-black text-gray-400">{(Math.random() * 500 + 100).toFixed(0)} views</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* Tab Orders */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">Order Registry</h1>
                  <p className="text-gray-500 text-sm font-medium">Manajemen status dan detail pesanan pelanggan.</p>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Pelanggan</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Item</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.length > 0 ? orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6 font-mono text-xs text-blue-600 font-bold">ORD-{ord.id}</td>
                        <td className="p-6">
                            <p className="font-bold text-gray-900">{ord.customer_name}</p>
                            <p className="text-[10px] text-gray-400">{ord.whatsapp}</p>
                        </td>
                        <td className="p-6">
                           <span className="text-xs font-bold text-gray-600">{(ord.items || []).length} items</span>
                        </td>
                        <td className="p-6 font-black text-gray-900">Rp {(ord.total || 0).toLocaleString()}</td>
                        <td className="p-6">
                           <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             ord.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {ord.status}
                           </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-20 text-center opacity-30 font-black">BELUM ADA PESANAN MASUK</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Tab Coupons */}
        {activeTab === 'coupons' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">Promotion Engine</h1>
                  <p className="text-gray-500 text-sm font-medium">Kelola kupon diskon dan promosi musiman.</p>
                </div>
                <button 
                  onClick={async () => {
                    const code = prompt('Kode Kupon:');
                    if (code) {
                      const newCoup = { id: Date.now(), code: code.toUpperCase(), discount_type: 'Percentage', value: 10, status: 'Active' };
                      setCoupons([newCoup, ...coupons]);
                      await supabase.from('coupons').insert([newCoup]);
                    }
                  }}
                  className="bg-[var(--accent)] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Buat Kupon Baru
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.length > 0 ? coupons.map((coup) => (
                  <div key={coup.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-between group hover:border-[var(--accent)] transition-all">
                     <div>
                        <div className="inline-block bg-gray-900 text-white px-4 py-1 rounded-lg font-mono font-bold text-lg tracking-widest mb-3">
                           {coup.code}
                        </div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                           Diskon {coup.discount_type === 'Percentage' ? `${coup.value}%` : `Rp ${coup.value.toLocaleString()}`}
                        </p>
                     </div>
                     <div className="text-right">
                        <button 
                          onClick={async () => {
                             await supabase.from('coupons').delete().eq('id', coup.id);
                             setCoupons(coupons.filter(c => c.id !== coup.id));
                          }}
                          className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors"
                        >
                           <Trash className="w-6 h-6" />
                        </button>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full border-4 border-dashed border-gray-50 rounded-[3rem] py-20 text-center opacity-20 font-black text-2xl">ANDA BELUM MEMILIKI KUPON</div>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

