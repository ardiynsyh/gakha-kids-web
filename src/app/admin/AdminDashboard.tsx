import { useState, useEffect } from 'react';
import { Package, Save, Plus, Trash, Settings, Image as ImageIcon, Link as LinkIcon, Edit3, Ruler, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [products, setProducts] = useState<any[]>([]);
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

      const { data: cData } = await supabase.from('store_config').select('*').eq('id', 'main').single();
      if (cData) setConfig(cData.config_data);

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
    const newProduct = {
      id: Date.now(),
      name: "Produk Baru",
      price: "Rp 0",
      image: "https://images.unsplash.com/photo-1632232963035-bc14755747c9?auto=format&fit=crop&w=500&q=60",
      color: "#cccccc",
      linktreeUrl: "https://linktr.ee/",
      categories: ["new"],
      sizes: ["S", "M", "L", "XL"],
      details: ""
    };
    setProducts([newProduct, ...products]);
  };

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
      <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-[0.3em] text-[10px]">Cloud Guard Verification...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'products' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Package className="w-5 h-5" />
            <span className="font-bold">Kelola Produk</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold">Pengaturan Toko</span>
          </button>
        </nav>

        {/* User Info & Logout */}
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

      {/* Main Content */}
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
                    <th className="p-6 w-[12%]">Harga</th>
                    <th className="p-6 w-[18%]">Varian Ukuran</th>
                    <th className="p-6 w-[15%]">Kategori & Label</th>
                    <th className="p-6 w-[20%]">Link Marketplace</th>
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
                      <td className="p-6 space-y-1">
                        <input 
                          type="text" 
                          value={p.price} 
                          onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none text-[var(--accent)] font-black text-base"
                        />
                        <input 
                          type="text" 
                          value={p.originalPrice || ''} 
                          onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none text-gray-400 line-through text-xs"
                          placeholder="Hrg Coret"
                        />
                      </td>
                      <td className="p-6">
                         <div className="space-y-3">
                            <div className="flex flex-wrap gap-1.5">
                               {(p.sizes || []).map((s: string) => (
                                 <span key={s} className="bg-gray-100/50 text-gray-600 text-[9px] px-2.5 py-1 rounded-md border border-gray-200 font-black uppercase">{s}</span>
                               ))}
                            </div>
                            <input 
                              type="text" 
                              placeholder="Ketik S, M, L, XL..."
                              className="w-full text-[11px] border border-gray-200 rounded-lg p-2 focus:border-[var(--accent)] transition-all outline-none"
                              onBlur={(e) => handleUpdateProduct(p.id, 'sizes', e.target.value.split(',').map(s => s.trim()))}
                            />
                            {p.size_chart_image && (
                               <div className="flex items-center gap-2 text-[10px] text-blue-500 font-bold">
                                  <Ruler className="w-3 h-3" /> Chart Aktif
                               </div>
                            )}
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="space-y-3">
                            <select
                              value={(p.categories || []).find((c: string) => c !== 'new') || 'born'}
                              onChange={(e) => {
                                const otherCats = (p.categories || []).includes('new') ? ['new'] : [];
                                handleUpdateProduct(p.id, 'categories', [...otherCats, e.target.value]);
                              }}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-[11px] font-bold text-gray-700 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            >
                              <option value="born">🤱 Born (0-6)</option>
                              <option value="baby">👶 Bayi (6-24)</option>
                              <option value="toddler">🧸 Toddler (2-5)</option>
                              <option value="boys">👦 Laki-Laki</option>
                              <option value="girls">👧 Perempuan</option>
                              <option value="accessories">🎒 Aksesoris</option>
                              <option value="sale">🏷️ Diskon</option>
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
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-mono text-[9px] text-blue-600 h-20 resize-none outline-none focus:border-blue-300"
                          placeholder="Linktree/Shopee/WA Link..."
                        />
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
      </main>
    </div>
  );
}

// Re-using the Ruler icon from lucide-react
const ShieldCheck = ({className}: {className?: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
