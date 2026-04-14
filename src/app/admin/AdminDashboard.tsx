import { useState, useEffect } from 'react';
import { Package, Save, Plus, Trash, Settings, Image as ImageIcon, Link as LinkIcon, Edit3, LogOut, User, ShoppingBag, Zap, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
    setUser(user);
  };

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (pData) setProducts(pData);

      const { data: cData } = await supabase.from('store_config').select('*').eq('id', 'main').single();
      if (cData) setConfig(cData.config_data);

      const { data: resData } = await supabase.from('resellers').select('*').order('created_at', { ascending: false });
      if (resData) setResellers(resData);

      const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordData) setOrders(ordData || []);

      const { data: coupData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (coupData) setCoupons(coupData || []);

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

  const saveProducts = async () => {
    setIsLoading(true);
    const tid = toast.loading("Saving to Cloud...");
    try {
      const { error } = await supabase.from('products').upsert(products);
      if (error) throw error;
      toast.success("Products synced!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    const tid = toast.loading("Saving configuration...");
    try {
        const { error: cError } = await supabase.from('store_config').upsert({ id: 'main', config_data: config });
        if (cError) throw cError;
        const { error: iError } = await supabase.from('info_pages').upsert(infoPages);
        if (iError) throw iError;
        toast.success("Settings saved!", { id: tid });
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
    const tid = toast.loading("Uploading image...");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Uploaded!", { id: tid });
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Hapus produk ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
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
      details: "",
      video: "",
      bundleIds: []
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

      toast.success("Berhasil tersinkron!", { id: loadingToast });
    } catch (error: any) {
      toast.error("Gagal: " + error.message, { id: loadingToast });
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
          {[
            { id: 'analytics', label: 'Dashboard & Analytics', icon: <Package className="w-5 h-5" /> },
            { id: 'products', label: 'Kelola Produk', icon: <Package className="w-5 h-5" /> },
            { id: 'orders', label: 'Pesanan Masuk', icon: <ShoppingBag className="w-5 h-5" /> },
            { id: 'coupons', label: 'Kupon & Promo', icon: <Zap className="w-5 h-5" /> },
            { id: 'resellers', label: 'Database Reseller', icon: <User className="w-5 h-5" /> },
            { id: 'settings', label: 'Pengaturan Toko', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
              {tab.icon} <span className="font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-left p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-5 h-5" /> <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 h-screen overflow-y-auto w-full">
        {activeTab === 'products' && (
          <div className="max-w-[1400px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Database Produk</h1>
                <p className="text-gray-500 mt-1">Status: <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Live Cloud</span></p>
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddProduct} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm"><Plus className="w-5 h-5" /> Tambah</button>
                <button onClick={handlePushAllToCloud} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95">🚀 Push to Cloud</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    <th className="p-6">Foto</th>
                    <th className="p-6">Nama</th>
                    <th className="p-6">Harga</th>
                    <th className="p-6">Stok Ukuran</th>
                    <th className="p-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-6">
                        <img src={p.image} className="w-12 h-12 object-cover rounded-lg" />
                      </td>
                      <td className="p-6">
                        <input type="text" value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="font-bold text-sm bg-transparent outline-none" />
                      </td>
                      <td className="p-6">
                        <input type="text" value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="font-bold text-blue-600 text-sm bg-transparent outline-none" />
                      </td>
                      <td className="p-6">
                        <div className="grid grid-cols-4 gap-2">
                           {(p.sizes || []).map((s: string) => (
                             <div key={s} className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase">{s}</span>
                                <input 
                                  type="number" 
                                  value={p.inventory?.[s] || 0}
                                  onChange={(e) => {
                                     const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                                     handleUpdateProduct(p.id, 'inventory', inv);
                                  }}
                                  className="w-12 bg-gray-50 border border-gray-100 rounded p-1 text-[10px] font-bold"
                                />
                             </div>
                           ))}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => handleDelete(p.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-3">Shop Performance</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Statistik Penjualan Gakha Kids</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                 {[
                   { label: "Total Omzet", val: `Rp ${orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}`, icon: <Package className="w-5 h-5 text-green-500" /> },
                   { label: "Total Pesanan", val: orders.length.toString(), icon: <ShoppingBag className="w-5 h-5 text-blue-500" /> },
                   { label: "Produk Aktif", val: products.length.toString(), icon: <Zap className="w-5 h-5 text-yellow-500" /> },
                   { label: "Kupon Aktif", val: coupons.length.toString(), icon: <Edit3 className="w-5 h-5 text-purple-500" /> },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-start">
                      <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">{stat.icon}</div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.val}</h3>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'coupons' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">PROMOTION ENGINE</h1>
                <button onClick={async () => {
                  const code = prompt('Kode Kupon:');
                  if (code) {
                    const newCoup = { id: Date.now(), code: code.toUpperCase(), discount_type: 'Percentage', value: 10, status: 'Active' };
                    setCoupons([newCoup, ...coupons]);
                    await supabase.from('coupons').insert([newCoup]);
                  }
                }} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Buat Kupon
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map((coup) => (
                  <div key={coup.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-between group hover:border-[var(--accent)] transition-all">
                     <div>
                        <div className="inline-block bg-gray-900 text-white px-4 py-1 rounded-lg font-mono font-bold text-lg tracking-widest mb-3">{coup.code}</div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Diskon {coup.discount_type === 'Percentage' ? `${coup.value}%` : `Rp ${coup.value.toLocaleString()}`}</p>
                     </div>
                     <button onClick={async () => {
                        await supabase.from('coupons').delete().eq('id', coup.id);
                        setCoupons(coupons.filter(c => c.id !== coup.id));
                     }} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors"><Trash className="w-6 h-6" /></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">ORDER REGISTRY</h1>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50">
                       <tr>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 uppercase tracking-widest">Order ID</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 uppercase tracking-widest">Pelanggan</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 uppercase tracking-widest">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {orders.map(ord => (
                          <tr key={ord.id}>
                             <td className="p-6 font-mono font-bold text-blue-600">ORD-{ord.id}</td>
                             <td className="p-6 font-bold">{ord.customer_name}</td>
                             <td className="p-6">
                                <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{ord.status}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
