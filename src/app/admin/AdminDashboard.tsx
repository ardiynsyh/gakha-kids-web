import { useState, useEffect } from 'react';
import {
  Package, Plus, Trash, Settings,
  Image as ImageIcon, LogOut, ShoppingBag, Zap,
  Eye, X, Phone, MapPin, Camera,
  Sparkles, Tag, RefreshCw, Printer, TrendingUp, BarChart3, MessageSquare, Filter, Layout, Bell, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'coupons' | 'settings'>('analytics');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAddingSize, setIsAddingSize] = useState<any>(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Completed' | 'Pending' | 'Refund Requested'>('all');
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [config, setConfig] = useState<any>({
    announcement: { isEnabled: true, text: '' },
    productCategories: [
      { id: 'all', name: 'SEMUA KATEGORI' },
      { id: 'new', name: 'NEW DROP' },
      { id: 'football', name: 'FOOTBALL CULTURE' },
      { id: 'regional', name: 'REGIONAL SERIES' },
      { id: 'sale', name: 'PENAWARAN SPESIAL' },
      { id: 'accessories', name: 'AKSESORIS' }
    ],
    socialMedia: { instagram: 'gakha.official', resellerWhatsApp: '628123456789' },
    hero: { headingLine1: 'GAKHA', headingLine2: 'FOOTBALL CULTURE', description: 'Premium Terrace Wear for the Culture', backgroundImage: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    checkUser();
    fetchData();

    // 1. Supabase Native Realtime (Jika diaktifkan di Database)
    const orderSubscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(current => {
          if (!current.find((o) => o.id === payload.new.id)) {
            toast.info(`🔔 PESANAN BARU! Dari ${payload.new.customer_name}`, { duration: 10000 });
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            return [payload.new, ...current];
          }
          return current;
        });
      })
      .subscribe();

    // 2. Realtime Stock Updates
    const productSubscription = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setProducts(current => current.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .subscribe();

    // 3. Intelligent Auto-Polling Fallback (Jika Realtime Mati)
    const pollingInterval = setInterval(async () => {
       const { data: latestOrders } = await supabase.from('orders').select('*').order('id', { ascending: false });
       if (latestOrders) {
          setOrders(prevOrders => {
             const isNew = latestOrders.length > prevOrders.length;
             if (isNew && prevOrders.length > 0) {
                 const newCount = latestOrders.length - prevOrders.length;
                 toast.success(`Terdapat ${newCount} Pesanan Baru masuk!`);
                 new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
             }
             return latestOrders; // Sinkronisasi penuh
          });
       }

       // Juga polling produk sesekali untuk memastikan sinkronisasi stok
       const { data: latestProducts } = await supabase.from('products').select('*').order('id', { ascending: false });
       if (latestProducts) setProducts(latestProducts);
    }, 10000); // Cek setiap 10 Detik untuk fallback (interval lebih santai untuk performa)

    return () => { 
      supabase.removeChannel(orderSubscription); 
      supabase.removeChannel(productSubscription);
      clearInterval(pollingInterval);
    };
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
      if (cData?.config_data) {
        // Gabungkan kategori secara aman
        setConfig((prev: any) => ({
          ...prev,
          ...cData.config_data,
          productCategories: prev.productCategories // Kunci ke list terbaru
        }));
      }
      const { data: ordData } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (ordData) setOrders(ordData);
      const { data: coupData } = await supabase.from('coupons').select('*');
      if (coupData) setCoupons(coupData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushAllToCloud = async () => {
    setIsLoading(true);
    const tid = toast.loading("Sinkronisasi Cloud...");
    try {
      for (const product of products) {
        await supabase.from('products').upsert(product, { onConflict: 'id' });
      }
      await supabase.from('store_config').upsert({ id: 'main', config_data: config });
      toast.success("Database Tersimpan Rapi!", { id: tid });
    } catch (e: any) { toast.error(`Error: ${e.message}`, { id: tid }); }
    setIsLoading(false);
  };

  const handleUpdateProduct = (id: any, field: string, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Math.floor(Math.random() * 900000000) + 100000000,
      name: "Produk Baru",
      price: "150000",
      originalPrice: "",
      image: "https://images.unsplash.com/photo-1540855513560-112df639c947?auto=format&fit=crop&q=80&w=300",
      categories: [selectedCategory === 'all' ? 'new' : selectedCategory],
      sizes: ["S", "M", "L", "XL", "XXL"],
      inventory: { "S": 10, "M": 10, "L": 10, "XL": 10, "XXL": 10 },
      weight: 200
    };
    setProducts([newProduct, ...products]);
  };

  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    const tid = toast.loading("Mengunggah Gambar...");
    try {
      const fileName = `gakha-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      callback(data.publicUrl);
      toast.success("Gambar Terpasang!", { id: tid });
    } catch (e: any) { toast.error(e.message, { id: tid }); }
  };

  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice Label - GAKHA</title>
            <style>
              body { font-family: monospace; padding: 20px; color: #000; }
              .label { border: 3px solid #000; padding: 20px; border-radius: 12px; max-width: 400px; margin: 0 auto; }
              .header { font-size: 24px; font-weight: bold; border-bottom: 2px solid #000; margin-bottom: 15px; padding-bottom: 10px; text-align: center; }
              .section { margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px; }
              .title { font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #666; }
              .value { font-size: 16px; font-weight: bold; }
              .address { font-size: 14px; margin-top: 5px; white-space: pre-wrap; }
              .items { background: #f5f5f5; padding: 10px; border-radius: 8px; margin-top: 15px; }
              .item-line { margin-bottom: 5px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="header">GAKHA<br/><span style="font-size: 12px; font-weight: normal;">SHIPPING LABEL</span></div>
               <div style="font-size: 10px; text-align: right; margin-bottom: 10px;">ID: #${order.id.toString().slice(-8)}</div>
              <div class="section">
                <div class="title">PENERIMA</div>
                <div class="value">${order.customer_name}</div>
                <div class="value">${order.whatsapp}</div>
              </div>
              <div class="section">
                <div class="title">ALAMAT PENGIRIMAN</div>
                <div class="value">${order.city}</div>
                <div class="address">${order.address}</div>
              </div>
              <div class="items">
                <div class="title" style="margin-bottom: 8px;">DETAIL PESANAN</div>
                ${order.items?.map((it: any) => `<div class="item-line">• ${it.name} [Size: ${it.size}] x${it.quantity}</div>`).join('')}
              </div>
              <div style="text-align: right; margin-top: 15px; font-size: 16px; font-weight: bold;">TOTAL: Rp ${order.total.toLocaleString()}</div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleUpdateOrderStatus = async (orderId: any, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      toast.success(`Pesanan ditandai ${newStatus}`);
    }
  };

  // ─── Marketplace Analytics Logic ───────────────────────────────────────────
  const getFilteredOrders = () => {
    return orders.filter(o => {
      const oDate = new Date(o.created_at);
      const sDate = new Date(selectedDate);
      
      if (timeFilter === 'day') {
        return oDate.toDateString() === sDate.toDateString();
      } else if (timeFilter === 'month') {
        return oDate.getMonth() === sDate.getMonth() && oDate.getFullYear() === sDate.getFullYear();
      } else {
        return oDate.getFullYear() === sDate.getFullYear();
      }
    }).filter(o => o.status === 'Completed');
  };

  const currentStats = getFilteredOrders();
  const totalRevenue = currentStats.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalShipping = currentStats.reduce((acc, o) => acc + (o.shipping_fee || 0), 0);
  const productRevenue = totalRevenue - totalShipping;
  const totalItemsSold = currentStats.reduce((acc, o) => {
    return acc + (Array.isArray(o.items) ? o.items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) : 0);
  }, 0);

  // Filtered lists for the tables
  const filteredProducts = products.filter(p => selectedCategory === 'all' || p.categories?.includes(selectedCategory));
  const filteredOrders = orders.filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter);

  const bestSellers = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);

  if (isSyncing) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] text-[var(--accent)] uppercase font-black tracking-widest mt-4">INITIALIZING SYSTEM</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-24 lg:w-72 bg-gray-950 text-white p-6 lg:p-8 flex flex-col flex-shrink-0 transition-all z-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-16 justify-center lg:justify-start">
          <div className="w-12 h-12 bg-[#2e7d32] border border-white/20 text-white flex items-center justify-center text-3xl font-black shadow-xl italic">G</div>
          <h2 className="text-2xl font-black italic tracking-tighter hidden lg:block uppercase">Gakha<span className="text-[#2e7d32]">Market</span></h2>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: 'analytics', label: 'Monitor Data', icon: <BarChart3 className="w-5 h-5" /> },
            { id: 'products', label: 'Produk & Stok', icon: <Package className="w-5 h-5" /> },
            { id: 'orders', label: 'Penjualan', icon: <ShoppingBag className="w-5 h-5" /> },
            { id: 'coupons', label: 'Kode Kupon', icon: <Zap className="w-5 h-5" /> },
            { id: 'settings', label: 'Seting Toko', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all relative group ${activeTab === tab.id ? 'bg-[#2e7d32] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} <span className="font-bold text-[11px] uppercase tracking-widest hidden lg:block">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full hidden lg:block" />}
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); navigate('/admin/login'); }} className="p-4 flex items-center gap-3 text-red-400 font-bold text-[11px] uppercase hover:bg-red-400/10 rounded-2xl transition-all">
          <LogOut className="w-5 h-5" /> <span className="hidden lg:block">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar relative">
        <AnimatePresence mode="wait">

          {/* TAB: MONITOR */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="analytics" className="p-8 lg:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Marketplace Analytics</h1>
                  <p className="text-gray-400 font-bold mb-0 mt-2 uppercase text-[10px] tracking-widest">Pantauan Arus Kas & Produk Terlaris</p>
                </div>

                <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
                   <select 
                     value={timeFilter} 
                     onChange={(e) => setTimeFilter(e.target.value as any)}
                     className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none"
                   >
                     <option value="day">Harian</option>
                     <option value="month">Bulanan</option>
                     <option value="year">Tahunan</option>
                   </select>
                   <input 
                     type="date" 
                     value={selectedDate} 
                     onChange={(e) => setSelectedDate(e.target.value)}
                     className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none"
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><BarChart3 className="w-12 h-12" /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Revenue Barang</p>
                  <h3 className="text-2xl font-black text-[#001a00] tracking-tighter">Rp {productRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><Truck className="w-12 h-12" /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Arus Kas Ongkir</p>
                  <h3 className="text-2xl font-black text-[#2e7d32] tracking-tighter">Rp {totalShipping.toLocaleString()}</h3>
                </div>
                <div className="bg-[#003300] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                   <div className="relative z-10">
                     <p className="text-[10px] font-black text-white/40 uppercase mb-2 tracking-widest">Total Terjual</p>
                     <h3 className="text-5xl font-black italic">{totalItemsSold} <span className="text-sm not-italic opacity-30 uppercase font-bold tracking-widest">Pcs</span></h3>
                   </div>
                   <Package className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 text-white" />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Gross Revenue</p>
                   <h3 className="text-2xl font-black text-blue-600 tracking-tighter">Rp {totalRevenue.toLocaleString()}</h3>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h4 className="text-[11px] font-black uppercase text-gray-400 mb-6 tracking-[0.3em] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--accent)]" /> Best Seller Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {bestSellers.map(p => (
                    <div key={p.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-[1.5rem]">
                      <img src={p.image} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-black truncate">{p.name}</p>
                        <p className="text-[10px] uppercase font-bold text-[var(--accent)] mt-1">{p.sold || 0} Terjual</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="products" className="flex flex-col h-full bg-gray-50/50">
              {/* Fixed Sticky Header for Products */}
              <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl p-6 lg:px-12 border-b border-gray-200 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {config.productCategories.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c.id ? 'bg-gray-950 text-[var(--accent)] shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddProduct} className="bg-white border border-gray-200 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all text-gray-800"><Plus className="w-4 h-4 text-[#2e7d32]" /> Tambah Produk</button>
                    <button onClick={handlePushAllToCloud} className="bg-[#003300] text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/10">
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sinkronisasi
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-12 space-y-6 flex-1">
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">Belum ada produk di kategori ini</p>
                  </div>
                )}

                {filteredProducts.map(p => {
                  // Logic Diskon Stempel
                  const priceNum = parseInt(p.price?.replace(/[^0-9]/g, '')) || 0;
                  const origNum = parseInt(p.originalPrice?.replace(/[^0-9]/g, '') || '0');
                  const disc = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;

                  return (
                    <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row items-center gap-8 relative group">

                      {/* Gambar Produk */}
                      <div className="relative w-32 h-32 flex-shrink-0 group/img">
                        <img src={p.image} className="w-full h-full rounded-[1.8rem] object-cover shadow-inner bg-gray-50" />
                        <label className="absolute inset-0 bg-black/60 rounded-[1.8rem] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadImage(e.target.files[0], (url) => handleUpdateProduct(p.id, 'image', url));
                          }} />
                          <Camera className="w-8 h-8 text-white" />
                        </label>
                        {disc > 0 && <div className="absolute -top-3 -right-3 bg-[#003300] text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-[11px] shadow-lg border-[3px] border-white rotate-12">-{disc}%</div>}
                      </div>

                      {/* Input Info Produk (Rapi/Compact) */}
                      <div className="flex-1 space-y-4 w-full">
                        <input value={p.name} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full font-black text-xl outline-none bg-transparent hover:bg-gray-50 focus:bg-gray-50 p-2 rounded-xl transition-colors border border-transparent focus:border-gray-200" placeholder="Nama Produk" />

                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Harga Jual</label>
                            <input value={p.price} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="w-full text-blue-600 font-bold text-sm bg-transparent outline-none" placeholder="Rp 150000" />
                          </div>
                          <div className="flex-1 bg-red-50/50 p-3 rounded-2xl border border-red-50/50">
                            <label className="text-[9px] font-black text-red-300 uppercase block mb-1">Harga Coret</label>
                            <input value={p.originalPrice} onChange={(e) => handleUpdateProduct(p.id, 'originalPrice', e.target.value)} className="w-full text-red-400 font-bold text-sm bg-transparent outline-none line-through" placeholder="(Opsional)" />
                          </div>
                          <div className="flex-1 bg-pink-50 p-3 rounded-2xl border border-pink-100">
                            <label className="text-[9px] font-black text-[var(--accent)]/50 uppercase block mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Kategori</label>
                            <select value={p.categories?.[0] || 'all'} onChange={(e) => handleUpdateProduct(p.id, 'categories', [e.target.value])} className="w-full text-[10px] font-black uppercase text-[var(--accent)] bg-transparent outline-none cursor-pointer">
                              {config.productCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                             <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Berat (Gram)</label>
                             <input type="number" value={p.weight || 200} onChange={(e) => handleUpdateProduct(p.id, 'weight', parseInt(e.target.value) || 0)} className="w-full font-bold text-sm bg-transparent outline-none" placeholder="Misal: 200" />
                          </div>
                        </div>
                      </div>

                      {/* Ukuran & Stok Horizontal */}
                      <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 max-w-[300px]">
                        {p.sizes?.map((s: string) => (
                          <div key={s} className="bg-gray-950 text-white rounded-[1.5rem] p-3 text-center relative shadow-md group/sz w-[65px] flex-shrink-0 border border-gray-800">
                            <button onClick={() => {
                              if (!confirm('Hapus ukuran ini?')) return;
                              const ns = p.sizes.filter((sz: string) => sz !== s);
                              const ni = { ...p.inventory }; delete ni[s];
                              handleUpdateProduct(p.id, 'sizes', ns);
                              handleUpdateProduct(p.id, 'inventory', ni);
                            }} className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/sz:opacity-100 transition-opacity z-10"><X className="w-3 h-3 text-white" /></button>
                            <p className="text-[9px] font-black text-gray-400 mb-1 uppercase tracking-widest">{s}</p>
                            <input type="number" value={p.inventory?.[s] || 0} onChange={(e) => {
                              const inv = { ...(p.inventory || {}), [s]: parseInt(e.target.value) || 0 };
                              handleUpdateProduct(p.id, 'inventory', inv);
                            }} className="w-full bg-transparent text-center font-black text-sm outline-none text-[var(--accent)]" />
                          </div>
                        ))}
                        <button onClick={() => setIsAddingSize(p.id)} className="w-[65px] h-[72px] border-2 border-dashed border-gray-300 rounded-[1.5rem] flex items-center justify-center text-gray-400 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-pink-50 transition-all flex-shrink-0"><Plus className="w-6 h-6" /></button>
                      </div>

                      <div className="flex-shrink-0">
                        <button onClick={() => { if (confirm('Hapus Produk Permanen?')) { supabase.from('products').delete().eq('id', p.id).then(() => fetchData()); } }} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"><Trash className="w-5 h-5" /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* TAB: PENJUALAN */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="orders" className="p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Daftar Penjualan</h1>
                  <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Kelola Transaksi Pelanggan</p>
                </div>
                
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                  {[
                    { id: 'all', label: 'SEMUA', icon: <Filter className="w-3.5 h-3.5" /> },
                    { id: 'Completed', label: 'SUKSES', icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" /> },
                    { id: 'Pending', label: 'PENDING', icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> },
                    { id: 'Refund Requested', label: 'REFUND', icon: <X className="w-3.5 h-3.5 text-red-500" /> },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderStatusFilter(f.id as any)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${orderStatusFilter === f.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
                    <tr className="border-b border-gray-100">
                      <th className="p-6 pl-8">ID Pesanan</th>
                      <th className="p-6">Pembeli</th>
                      <th className="p-6">Nominal</th>
                      <th className="p-6">No. Resi (AWB)</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-20 text-center">
                          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tidak ada pesanan dengan status ini</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                          <td className="p-6 pl-8 font-mono font-bold text-gray-400">#{o.id.toString().slice(-6)}</td>
                          <td className="p-6 font-black text-gray-900 uppercase">{o.customer_name}</td>
                          <td className="p-6 font-black text-[var(--accent)]">Rp {o.total.toLocaleString()}</td>
                          <td className="p-6 font-bold text-gray-400">{o.tracking_number || '-'}</td>
                          <td className="p-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                              o.status === 'Completed' || o.status === 'Shipped' ? 'bg-green-100 text-green-600' :
                              o.status === 'Refund Requested' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {o.status === 'Refund Requested' ? 'Refund' : o.status}
                            </span>
                          </td>
                          <td className="p-6"><button onClick={() => setSelectedOrder(o)} className="bg-gray-950 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all"><Eye className="w-4 h-4 text-pink-400" /> Kelola</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: KUPON */}
          {activeTab === 'coupons' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="coupons" className="p-8 lg:p-12">
              <div className="flex justify-between items-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Manajemen Kupon</h1>
                <button onClick={() => setIsAddingCoupon(true)} className="bg-gray-950 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"><Plus className="w-4 h-4 text-[var(--accent)]" /> Buat Kupon</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {coupons.map(c => {
                  const isExp = c.expiry_date && new Date(c.expiry_date) < new Date();
                  if (isExp) return null; // Sembunyikan otomatis jika kadaluarsa
                  return (
                    <div key={c.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative group overflow-hidden">
                      <span className="absolute top-6 right-6 bg-red-50 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Valid: {c.expiry_date || 'Permanen'}</span>
                      <div className="bg-gray-900 text-[var(--accent)] px-8 py-3 rounded-2xl font-mono font-black text-2xl mb-4 mt-4 tracking-tight shadow-md border border-gray-800">{c.code}</div>
                      <p className="text-4xl font-black mb-1">{c.value}% <span className="text-sm text-gray-400 uppercase tracking-widest">OFF</span></p>
                      <button onClick={async () => { if (confirm('Hapus Coupon?')) { await supabase.from('coupons').delete().eq('id', c.id); fetchData(); } }} className="mt-6 text-red-400 font-black text-[10px] uppercase underline hover:text-red-600">Hapus Kupon</button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* TAB: PENGATURAN TOKO */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="settings" className="p-8 lg:p-12 max-w-4xl space-y-8">
              <div className="bg-gray-950 text-white p-10 rounded-[3rem] shadow-xl flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Konfigurasi Toko</h1>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Atur Tampilan Halaman Utama</p>
                </div>
                <button onClick={handlePushAllToCloud} className="bg-[var(--accent)] text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg relative z-10 hover:scale-105 transition-all">Simpan Pengaturan</button>
                <Settings className="absolute -bottom-10 -right-4 w-40 h-40 opacity-5 rotate-12" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-5 shadow-sm">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2"><Layout className="w-4 h-4 text-blue-500" /> Teks Hero Display</p>
                  <input value={config.hero?.headingLine1} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, headingLine1: e.target.value } })} className="w-full bg-gray-50/50 border border-gray-200 p-4 rounded-xl outline-none font-bold" placeholder="Teks Baris 1" />
                  <input value={config.hero?.headingLine2} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, headingLine2: e.target.value } })} className="w-full bg-pink-50/50 border border-pink-100 p-4 rounded-xl font-black text-[var(--accent)] outline-none" placeholder="Teks Aksen" />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-5 shadow-sm">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2"><Phone className="w-4 h-4 text-green-500" /> Link Social & CS</p>
                  <input value={config.socialMedia?.instagram} onChange={(e) => setConfig({ ...config, socialMedia: { ...config.socialMedia, instagram: e.target.value } })} className="w-full bg-gray-50/50 border border-gray-200 p-4 rounded-xl outline-none font-bold text-sm" placeholder="URL Instagram" />
                  <input value={config.socialMedia?.resellerWhatsApp} onChange={(e) => setConfig({ ...config, socialMedia: { ...config.socialMedia, resellerWhatsApp: e.target.value } })} className="w-full bg-green-50/50 border border-green-100 p-4 rounded-xl outline-none font-black text-green-600 text-sm" placeholder="Nomor WA (Mulai dari 628...)" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-5 shadow-sm text-center">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest italic flex items-center justify-center gap-2"><Bell className="w-4 h-4 text-orange-400" /> Teks Bar Pengumuman Atas</p>
                <input value={config.announcement?.text} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, text: e.target.value } })} className="w-full max-w-2xl mx-auto bg-orange-50/50 border border-orange-200 p-5 rounded-2xl font-black text-orange-600 text-center outline-none" placeholder="Contoh: PROMO FREE ONGKIR" />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* POPUPS SECTION */}

      {/* 1. Popup Add Size */}
      <AnimatePresence>
        {isAddingSize && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
              <h3 className="text-2xl font-black mb-6 uppercase italic tracking-tighter">Tambah Ukuran</h3>
              <input id="szInput" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none font-black text-2xl text-center mb-6 uppercase" placeholder="MISAL: XL / 4Y" autoFocus />
              <div className="flex gap-4">
                <button onClick={() => setIsAddingSize(null)} className="flex-1 py-3 font-black uppercase text-[10px] text-gray-400 hover:bg-gray-50 rounded-xl">Batal</button>
                <button onClick={() => {
                  const v = (document.getElementById('szInput') as HTMLInputElement).value;
                  if (v) {
                    setProducts(prev => prev.map(p => p.id === isAddingSize ? { ...p, sizes: [...(p.sizes || []), v.toUpperCase()], inventory: { ...(p.inventory || {}), [v.toUpperCase()]: 0 } } : p));
                    setIsAddingSize(null);
                  }
                }} className="flex-1 bg-[#003300] text-white py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all">Tambahkan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Popup Add Coupon */}
      <AnimatePresence>
        {isAddingCoupon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xl">
              <h3 className="text-3xl font-black mb-8 uppercase italic text-center tracking-tighter">Buat Kode Kupon</h3>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Kode Unik:</label>
                  <input id="ccode" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-black text-2xl uppercase tracking-widest outline-none" placeholder="GAKHA50" />
                </div>
                <div className="flex gap-5">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Potongan (%):</label>
                    <input id="cval" type="number" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-black text-xl outline-none" placeholder="50" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Berlaku Sampai (Opsional):</label>
                    <input id="cexp" type="date" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-black text-sm outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsAddingCoupon(false)} className="flex-1 py-4 font-black uppercase text-[10px] text-gray-400 hover:bg-gray-50 rounded-xl">Batal</button>
                <button onClick={() => {
                  const c = (document.getElementById('ccode') as HTMLInputElement).value;
                  const v = (document.getElementById('cval') as HTMLInputElement).value;
                  const e = (document.getElementById('cexp') as HTMLInputElement).value;
                  if (c && v) {
                    supabase.from('coupons').insert([{ id: Date.now(), code: c.toUpperCase(), value: parseInt(v), expiry_date: e || null }]).then(() => { fetchData(); setIsAddingCoupon(false); toast.success("Kupon Dibuat!"); });
                  }
                }} className="flex-1 bg-[var(--accent)] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg border border-pink-500 hover:scale-105 transition-all">Simpan Kupon</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Popup Order Detail (Sangat Rapih) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-10 bg-gray-950/80 backdrop-blur-md">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-full">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 lg:top-8 lg:right-8 p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-10 transition-all"><X className="w-5 h-5" /></button>

              {/* Bagian Kiri: Info Pembeli & Resi */}
              <div className="flex-1 p-8 lg:p-14 overflow-y-auto custom-scrollbar">
                <span className="bg-blue-50/50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Detail Pesanan</span>
                <h2 className="text-4xl lg:text-5xl font-black mb-10 tracking-tighter uppercase italic text-gray-900">{selectedOrder.customer_name}</h2>

                <div className="space-y-4 mb-10">
                  {/* Info Alamat Lengkap */}
                  <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex gap-5 items-start">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 text-blue-500"><MapPin className="w-6 h-6" /></div>
                    <div className="text-sm pt-1 w-full">
                      <p className="font-black text-lg mb-1">{selectedOrder.city}</p>
                      <p className="text-gray-500 font-medium leading-relaxed bg-white p-3 rounded-xl border border-gray-100 mt-2">{selectedOrder.address}</p>
                    </div>
                  </div>
                  {/* Info Kontak */}
                  <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 text-green-500"><Phone className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <p className="font-black text-xl">{selectedOrder.whatsapp}</p>
                    </div>
                  </div>
                </div>

                {/* Input AWB & Notifikasi WA */}
                <div className="bg-blue-50/30 border border-blue-100 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase text-blue-500 mb-3 tracking-widest flex items-center gap-2"><Package className="w-4 h-4" /> Input Nomor Resi Pengiriman</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input id="awb" value={selectedOrder.tracking_number} onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })} className="flex-1 bg-white p-4 rounded-xl outline-none font-black text-lg border border-blue-200 shadow-inner" placeholder="Contoh: JNEXXX123" />
                    <button onClick={() => {
                      const a = (document.getElementById('awb') as HTMLInputElement).value;
                      if (a) {
                        supabase.from('orders').update({ tracking_number: a, status: 'Shipped' }).eq('id', selectedOrder.id).then(() => {
                          // Update state immediately without waiting for Supabase reflection
                          setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, tracking_number: a, status: 'Shipped' } : o));
                          setSelectedOrder(null);
                          toast.success("AWB Disimpan!");
                          // Otomatis WA
                          const msg = `Halo Kak ${selectedOrder.customer_name},\n\nTerima kasih sudah belanja di GAKHA. Pesanan Kakak sedang dalam pengiriman.\n\nKurir: *Cek Status Resi*\nNo Resi (AWB): *${a}*\n\nDitunggu kedatangan paketnya ya!`;
                          window.open(`https://wa.me/${selectedOrder.whatsapp}?text=${encodeURIComponent(msg)}`);
                        });
                      }
                    }} className="bg-blue-600 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all whitespace-nowrap flex items-center justify-center gap-2"><MessageSquare className="w-4 h-4" /> Simpan & WA</button>
                  </div>
                </div>
              </div>

              {/* Bagian Kanan: Barang Belanjaan & Action */}
              <div className="w-full md:w-[400px] bg-gray-950 text-white p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] italic">Daftar Belanja</h4>
                  </div>
                  <div className="space-y-5 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                    {selectedOrder.items?.map((it: any, i: number) => (
                      <div key={i} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <img src={it.image} className="w-14 h-14 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-bold leading-tight mb-1">{it.name}</p>
                          <p className="text-[10px] font-black uppercase text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full inline-block">Size: {it.size} &nbsp;&bull;&nbsp; Qty: {it.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-8 border-t border-white/10 mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[11px] font-black uppercase text-gray-400">Total Harga</span>
                    <span className="text-3xl font-black text-[var(--accent)]">Rp {selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handlePrintInvoice(selectedOrder)} className="w-full border-2 border-white/20 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex justify-center items-center gap-2"><Printer className="w-4 h-4" /> Print Label Alamat</button>
                    <button onClick={() => {
                        const oid = selectedOrder.id;
                        setOrders(orders.map(o => o.id === oid ? { ...o, status: 'Completed' } : o));
                        setSelectedOrder(null);
                        toast.success("Pesanan telah selesai!");
                        supabase.from('orders').update({status: 'Completed'}).eq('id', oid);
                    }} className="w-full bg-green-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all flex justify-center items-center gap-2"><CheckCircle className="w-4 h-4" /> Selesaikan Pesanan</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
