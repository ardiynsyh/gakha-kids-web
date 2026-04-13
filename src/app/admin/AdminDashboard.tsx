import { useState, useEffect } from 'react';
import { Package, Save, Plus, Trash, Settings, Image as ImageIcon, Link as LinkIcon, Edit3 } from 'lucide-react';
import type { Product } from '../../data/products';
import productsData from '../../data/products.json';
import storeConfigData from '../../data/storeConfig.json';
import infoPagesData from '../../data/infoPages.json';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>(productsData as Product[]);
  const [config, setConfig] = useState<any>(storeConfigData);
  const [infoPages, setInfoPages] = useState<any>(infoPagesData);
  const [isLoading, setIsLoading] = useState(false);
  
  // No need for dynamic imports in useEffect since we use static imports now.
  // This resolves build warnings about duplicate imports.
  useEffect(() => {
    // We can still trigger re-renders if necessary, but initial state is enough.
  }, []);

  const saveProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products, null, 2),
      });
      if (res.ok) {
        alert('Produk berhasil disimpan! Silakan cek web depan.');
      } else {
        alert('Gagal menyimpan produk.');
      }
    } catch (e) {
      alert('Error saat menyimpan: ' + e);
    }
    setIsLoading(false);
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      // Save storeConfig
      const res1 = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config, null, 2),
      });
      
      // Save infoPages
      const res2 = await fetch('/api/save-info-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoPages, null, 2),
      });

      if (res1.ok && res2.ok) {
        alert('Seluruh Pengaturan & Konten berhasil disimpan!');
      } else {
        alert('Terjadi kesalahan saat menyimpan.');
      }
    } catch (e) {
      alert('Error saat menyimpan: ' + e);
    }
    setIsLoading(false);
  };

  const handleUpdateProduct = (id: number, key: keyof Product, value: any) => {
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
          alert('Upload gagal: ' + json.error);
        }
      } catch (e) {
        alert('Gagal upload: ' + e);
      }
    };
  };

  const handleDelete = (id: number) => {
    if (confirm('Hapus produk ini?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
    }
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      name: "Produk Baru",
      price: "Rp 0",
      image: "https://images.unsplash.com/photo-1632232963035-bc14755747c9?auto=format&fit=crop&w=500&q=60",
      color: "#cccccc",
      linktreeUrl: "https://linktr.ee/",
      categories: ["new"]
    };
    setProducts([...products, newProduct]);
  };

  if (!config) return <div className="p-10 text-center">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block flex-shrink-0 relative z-20">
        <h2 className="text-2xl font-bold mb-8 text-[var(--accent)]">Admin Panel</h2>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Kelola Produk</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Pengaturan Toko</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 h-screen overflow-y-auto w-full max-w-full">
        {activeTab === 'products' && (
          <div className="max-w-[1200px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Kelola Produk</h1>
                <p className="text-gray-500 mt-1">Ubah nama, harga, kategori, dan tautan Linktree produk Anda.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Produk
                </button>
                <button 
                  onClick={() => saveProducts()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition shadow-md font-medium"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium text-sm">
                    <th className="p-4 w-16">Foto</th>
                    <th className="p-4 w-[20%]">Nama Produk</th>
                    <th className="p-4 w-[15%]">Harga</th>
                    <th className="p-4 w-[12%]">Terbaru?</th>
                    <th className="p-4 w-[15%]">Kategori</th>
                    <th className="p-4 w-[23%]">Linktree URL</th>
                    <th className="p-4 w-[10%] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="relative group w-12 h-12 shrink-0">
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-md shadow-sm" />
                          <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <span className="text-[10px] font-bold">Ubah</span>
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
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={p.name} 
                          onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--accent)] focus:outline-none transition-colors px-1 py-1 font-medium"
                        />
                      </td>
                      <td className="p-4 space-y-2">
                        <input 
                          type="text" 
                          value={p.price} 
                          onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)}
                          className="w-full bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-[var(--accent)] focus:outline-none transition-colors px-1 py-1 text-[var(--accent)] font-bold text-sm"
                          placeholder="Harga (Rp 100.000)"
                        />
                        <input 
                          type="text" 
                          value={p.originalPrice || ''} 
                          onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)}
                          className="w-full bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-[var(--accent)] focus:outline-none transition-colors px-1 py-1 text-gray-400 line-through text-xs"
                          placeholder="Hrg Coret (Opsional)"
                        />
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => {
                            const isNew = (p.categories || []).includes('new');
                            const newCats = isNew 
                              ? (p.categories || []).filter((c: string) => c !== 'new')
                              : [...(p.categories || []), 'new'];
                            handleUpdateProduct(p.id, 'categories', newCats);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                            (p.categories || []).includes('new') 
                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200 grayscale'
                          } border`}
                        >
                          {(p.categories || []).includes('new') ? '✅ Tampil' : '⏸ Pasif'}
                        </button>
                      </td>
                      <td className="p-4">
                        <select
                          value={(p.categories || []).find((c: string) => c !== 'new') || 'born'}
                          onChange={(e) => {
                            const otherCats = (p.categories || []).includes('new') ? ['new'] : [];
                            handleUpdateProduct(p.id, 'categories', [...otherCats, e.target.value]);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition-all text-[11px] font-bold text-gray-700"
                        >
                          <option value="born">🤱 New Born (0-6 Bln)</option>
                          <option value="baby">👶 Bayi (6-24 Bln)</option>
                          <option value="toddler">🧸 Toddler (2-5 Thn)</option>
                          <option value="boys">👦 Anak Laki-Laki</option>
                          <option value="girls">👧 Anak Perempuan</option>
                          <option value="accessories">🎒 Aksesoris</option>
                          <option value="sale">🏷️ Diskon</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={p.linktreeUrl || ''} 
                          onChange={(e) => handleUpdateProduct(p.id, 'linktreeUrl', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--accent)] focus:outline-none transition-colors px-1 py-1 font-mono text-xs text-blue-600"
                          placeholder="https://linktr.ee/..."
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Hapus Produk"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Belum ada produk.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-[1000px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Pengaturan Toko</h1>
                <p className="text-gray-500 mt-1">Ubah identitas dan konten promosi utama di website pelanggan Anda.</p>
              </div>
              <button 
                onClick={saveConfig}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition shadow-md font-medium"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Announcement Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-50 rounded-lg">
                      <Edit3 className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Announcement Bar (Top)</h2>
                      <p className="text-sm text-gray-500">Pemberitahuan baris tunggal di bagian paling atas website.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">Status:</span>
                    <button 
                      onClick={() => setConfig({
                        ...config, 
                        announcement: { ...config.announcement, isEnabled: !config.announcement.isEnabled }
                      })}
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter transition-all ${config.announcement.isEnabled ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                    >
                      {config.announcement.isEnabled ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Teks Pengumuman</label>
                    <input 
                      type="text" 
                      value={config.announcement.text}
                      onChange={(e) => setConfig({
                        ...config, 
                        announcement: { ...config.announcement, text: e.target.value }
                      })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[var(--accent)] focus:bg-white focus:outline-none transition-all text-sm font-medium"
                      placeholder="Contoh: Gratis Ongkir ke Seluruh Indonesia!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Tautan Tujuan (Link)</label>
                    <input 
                      type="text" 
                      value={config.announcement.link}
                      onChange={(e) => setConfig({
                        ...config, 
                        announcement: { ...config.announcement, link: e.target.value }
                      })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[var(--accent)] focus:bg-white focus:outline-none transition-all text-sm font-mono"
                      placeholder="/shop/sale"
                    />
                  </div>
                </div>
              </div>

              {/* Sosmed Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <LinkIcon className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800">Tautan Sosial Media</h2>
                </div>
                <div className="space-y-4">
                  {['instagram', 'tiktok', 'twitter', 'facebook', 'resellerWhatsApp'].map((platform) => (
                    <div key={platform}>
                      <label className="block text-sm font-semibold text-gray-600 mb-1 capitalize">
                        {platform === 'resellerWhatsApp' ? 'WhatsApp Reseller (Hanya Angka: 628...)' : platform}
                      </label>
                      <input 
                        type="text" 
                        value={config.socialMedia[platform]}
                        onChange={(e) => setConfig({
                          ...config, 
                          socialMedia: { ...config.socialMedia, [platform]: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:border-[var(--accent)] focus:bg-white focus:outline-none transition-all font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Banner Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800">Gambar Hero Banner</h2>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video group cursor-pointer border-2 border-dashed border-gray-300 hover:border-[var(--accent)] transition-colors">
                  <img src={config.hero.backgroundImage} alt="Hero" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg flex items-center justify-center gap-2">
                       <Edit3 className="w-4 h-4"/> Ganti Gambar
                     </span>
                     <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadImage(e.target.files[0], (url) => setConfig({
                            ...config, hero: { ...config.hero, backgroundImage: url }
                          }));
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="mt-4 space-y-3">
                   <div>
                     <label className="block text-sm font-semibold text-gray-600 mb-1">Judul Baris 1</label>
                     <input type="text" value={config.hero.headingLine1} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine1: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Gaya Nyaman &" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-600 mb-1">Judul Baris 2 (Highlight)</label>
                     <input type="text" value={config.hero.headingLine2} onChange={(e) => setConfig({...config, hero: {...config.hero, headingLine2: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Keren" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-600 mb-1">Teks Badge (Contoh: Diskon 70%)</label>
                     <input type="text" value={config.hero.badge} onChange={(e) => setConfig({...config, hero: {...config.hero, badge: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-600" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-600 mb-1">Deskripsi Pendek</label>
                     <textarea value={config.hero.description} onChange={(e) => setConfig({...config, hero: {...config.hero, description: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-20" rows={3}></textarea>
                   </div>
                </div>
              </div>

              {/* Bento Grid Categories */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800">Gambar Kategori (Bento Grid)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {config.topDeals?.map((deal: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                       <h3 className="font-bold text-gray-800 mb-3">{deal.title}</h3>
                       <div className="relative rounded-lg overflow-hidden bg-gray-200 aspect-square group cursor-pointer border border-dashed border-gray-300">
                          <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/50 text-white flex flex-col flex-1 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-sm font-bold">Ubah Foto</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUploadImage(e.target.files[0], (url) => {
                                    const newDeals = [...config.topDeals];
                                    newDeals[i].image = url;
                                    setConfig({...config, topDeals: newDeals});
                                  });
                                }
                              }}
                            />
                          </label>
                       </div>
                       <input 
                         type="text" 
                         value={deal.title} 
                         onChange={(e) => {
                           const newDeals = [...config.topDeals];
                           newDeals[i].title = e.target.value;
                           setConfig({...config, topDeals: newDeals});
                         }}
                         className="w-full mt-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                       />
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Center Content Editor */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800">Isi Konten Halaman Pusat Bantuan</h2>
                </div>
                <div className="space-y-8">
                  {infoPages && Object.keys(infoPages).map((key) => (
                    <div key={key} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                       <h3 className="text-lg font-bold text-[var(--accent)] mb-4 flex items-center gap-2 capitalize">
                         📌 Halaman: {key.replace('-', ' ')}
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Judul Halaman</label>
                               <input 
                                 type="text" 
                                 value={infoPages[key].title} 
                                 onChange={(e) => setInfoPages({...infoPages, [key]: {...infoPages[key], title: e.target.value}})}
                                 className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                               />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Gambar Pemanis</label>
                               <input 
                                 type="text" 
                                 value={infoPages[key].image} 
                                 onChange={(e) => setInfoPages({...infoPages, [key]: {...infoPages[key], image: e.target.value}})}
                                 className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-mono"
                               />
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Isi Konten (Tulis Teks Saja)</label>
                             <textarea 
                               value={infoPages[key].content} 
                               onChange={(e) => setInfoPages({...infoPages, [key]: {...infoPages[key], content: e.target.value}})}
                               className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm h-48"
                               placeholder="Tulis informasi di sini... Enter untuk baris baru."
                             />
                          </div>
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
