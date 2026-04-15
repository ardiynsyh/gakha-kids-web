import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import blogPosts from '../../data/blogPosts.json';
import { ResellerProgram } from '../components/ResellerProgram';
import { useStore } from '../context/StoreContext';
import { supabase } from '../../lib/supabase';

export function InfoPage() {
  const { id } = useParams();
  const { config } = useStore();
  const [cloudPage, setCloudPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const resellerNumber = config?.socialMedia?.resellerWhatsApp || "628123456789";

  useEffect(() => {
    async function fetchPage() {
      setIsLoading(true);
      const { data } = await supabase
        .from('info_pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setCloudPage(data);
      else setCloudPage(null);
      setIsLoading(false);
    }
    fetchPage();
  }, [id]);

  const getTitle = () => {
    if (cloudPage) return cloudPage.title;
    switch (id) {
      case 'contact': return 'Hubungi Kami';
      case 'shipping': return 'Info Pengiriman';
      case 'returns': return 'Kebijakan Pengembalian';
      case 'size-guide': return 'Panduan Ukuran';
      case 'faq': return 'Pertanyaan yang Sering Diajukan (FAQ)';
      case 'gift-cards': return 'Kartu Hadiah';
      case 'privacy': return 'Kebijakan Privasi';
      case 'terms': return 'Syarat & Ketentuan';
      case 'cookies': return 'Kebijakan Cookies';
      case 'blog': return 'Blog & Artikel';
      case 'about': return 'Tentang Kami';
      case 'reseller': return 'Program Kemitraan Reseller';
      default: return 'Halaman Informasi';
    }
  };

  const getContent = () => {
    if (cloudPage) {
      return (
        <>
          {cloudPage.image && (
            <div className={`w-full h-64 rounded-2xl overflow-hidden mb-8 ${id === 'shipping' ? 'bg-white p-6 border border-[var(--border-color)]' : ''}`}>
               <img 
                 src={cloudPage.image} 
                 className={`w-full h-full ${id === 'shipping' ? 'object-contain' : 'object-cover'}`} 
                 alt={cloudPage.title} 
               />
            </div>
          )}
          <div className="help-content text-[var(--text-secondary)] text-lg leading-relaxed whitespace-pre-wrap">
            {cloudPage.content}
          </div>
        </>
      );
    }

    // Static fallback or special pages
    switch (id) {
      case 'reseller':
        return <ResellerProgram />;
      case 'blog':
        return (
          <>
            <p className="text-lg leading-relaxed text-[var(--text-secondary)] mb-8">
              Selamat datang di Jurnal <strong>GAKHA</strong>. Sudut pandang kami seputar kultur sepak bola, fashion stadion, dan cerita di balik setiap koleksi yang kami luncurkan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {blogPosts.map((post) => (
                <Link to={`/blog/${post.id}`} key={post.id} className="border border-[var(--border-color)] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-[var(--bg-primary)] group cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} />
                    <div className="absolute top-4 left-4 bg-[var(--bg-primary)]/90 backdrop-blur text-[var(--accent)] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{post.category}</div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center text-sm text-[var(--text-secondary)] mb-4 gap-4">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent)] transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <span className="text-sm font-bold text-[var(--accent)] border-b-2 border-transparent group-hover:border-[var(--accent)] pb-1 transition-all">Baca Artikel Penuh &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        );
      case 'about':
        return (
          <>
            <div className="w-full relative rounded-3xl overflow-hidden mb-12 h-[350px] shadow-lg group">
              <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Tentang GAKHA" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end justify-start p-10">
                 <div className="max-w-2xl text-left">
                   <h2 className="text-white text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-none mb-4 drop-shadow-xl font-serif italic">Identity of the Terrace<br/>Since 2024</h2>
                   <p className="text-white/90 text-lg font-medium drop-shadow-md">Membangun kebanggaan di setiap detak jantung kultur sepak bola.</p>
                 </div>
              </div>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-6">
                   <span className="w-12 h-1 bg-[var(--accent)] rounded-full"></span>
                   <h3 className="text-2xl font-black text-[var(--text-primary)] m-0">Titik Mula Kami</h3>
                </div>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  <strong>GAKHA</strong> lahir dari kecintaan yang mendalam terhadap sepak bola dan subkultur tribun yang mengelilinginya. Kami percaya bahwa apa yang Anda kenakan di stadion adalah pernyataan identitas, sejarah, dan kesetiaan tanpa syarat.
                </p>
              </section>

              <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 mt-12">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] m-0 mb-4">Mari Tumbuh Bersama</h3>
                 <p className="text-[var(--text-secondary)] mb-6">
                  Apabila Anda adalah seniman rajut lokal, distributor kapas organik, atau sekadar ibu yang ingin membagikan kisahnya kepada audiens kami, kanal komunikasi kami selalu terbuka secara profesional.
                 </p>
                 <a 
                    href={`https://wa.me/${resellerNumber}?text=Halo%20GAKHA,%20saya%20tertarik%20untuk%20menjalin%20kolaborasi%20bisnis.`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold px-6 py-3 rounded-xl hover:bg-[var(--accent)] transition-colors"
                 >
                    Mulai Kolaborasi <span className="text-xl">🤝</span>
                 </a>
              </section>
            </div>
          </>
        );
      default:
        return isLoading ? <p className="text-center animate-pulse">Menghubungi Server...</p> : (
          <>
            <p>Halaman yang Anda tuju sedang kami siapkan.</p>
            <Link to="/" className="text-[var(--accent)] font-semibold hover:underline">Kembali ke Beranda Utama</Link>
          </>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-32 min-h-[50vh]">
      <h1 className="text-[clamp(1.5rem,5vw,3rem)] font-black text-[var(--text-primary)] mb-8 text-center">{getTitle()}</h1>
      <div className="prose prose-lg max-w-none text-[var(--text-secondary)] bg-[var(--bg-primary)] p-[clamp(1rem,5vw,3rem)] rounded-[2.5rem] border border-[var(--border-color)] shadow-xl leading-relaxed antialiased">
        {getContent()}
      </div>
    </div>
  );
}
