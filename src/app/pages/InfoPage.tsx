import { useParams, Link } from 'react-router';
import infoPagesRaw from '../../data/infoPages.json';
import blogPosts from '../../data/blogPosts.json';

const infoPages = infoPagesRaw as Record<string, any>;

export function InfoPage() {
  const { id } = useParams();

  const getTitle = () => {
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
      default: return 'Halaman Informasi';
    }
  };

  const getContent = () => {
    if (infoPages[id as string]) {
      const page = infoPages[id as string];
      return (
        <>
          {page.image && (
            <div className={`w-full h-64 rounded-2xl overflow-hidden mb-8 ${id === 'shipping' ? 'bg-white p-6 border border-[var(--border-color)]' : ''}`}>
               <img 
                 src={page.image} 
                 className={`w-full h-full ${id === 'shipping' ? 'object-contain' : 'object-cover'}`} 
                 alt={page.title} 
               />
            </div>
          )}
          <div className="help-content text-[var(--text-secondary)] text-lg leading-relaxed whitespace-pre-wrap">
            {page.content}
          </div>
        </>
      );
    }

    switch (id) {
      case 'gift-cards':
        return (
          <>
            <p>Memilih pakaian sebagai hadiah kerap membingungkan. Berikan kebebasan berbelanja bagi si kecil di hari ulang tahunnya menggunakan <strong>E-Gift Card Saksag-Go!!</strong></p>
            <h3>Cara Kerja E-Gift Card</h3>
            <ol>
              <li>Pilih nominal (Rp 100rb, Rp 200rb, atau Rp 500rb).</li>
              <li>Kartu hadiah digital beserta kode voucher akan masuk ke email kerabat (atau anak) yang Anda tuju dengan ucapan istimewa.</li>
              <li>Kode otomatis berlaku selama satu (1) tahun di website kami untuk memotong pesanan mereka.</li>
            </ol>
            <p><em>Fitur Gift Card akan segera aktif di akhir bulan ini. Dapatkan diskon Early Bird untuk pembagian kartu hadiah Anda nanti.</em></p>
          </>
        );
      case 'privacy':
        return (
          <>
            <p>Kami menjunjung tinggi keamanan data pribadi Anda. Kebijakan privasi ini menetapkan penjelasan bagaimana *Saksag-Go!* melindungi informasi pengguna.</p>
            <h3>Data yang Dikumpulkan</h3>
            <p>Hanya nama kontak, alamat email, no hp, alamat persinggahan, serta tipe gawai demi keperluan analitik semata.</p>
            <h3>Penggunaan Data</h3>
            <p>Data yang tercatat tidak diperjualbelikan kepada tim pemasaran pihak ketiga dan murni digunakan untuk memperlancar pesanan Anda (terintegrasi ke ekspedisi/kurir).</p>
            <p>Untuk mengajukan permohonan penghapusan riwayat akun, kirimkan email Anda ke tim developer kami.</p>
          </>
        );
      case 'terms':
        return (
          <>
            <p>Selamat datang di platform E-Commerce Saksag-Go!. Akses Anda patuh pada Syarat & Ketentuan dari pihak manajemen kami.</p>
            <h3>Ketersediaan Barang</h3>
            <p>Seluruh stok diatur secara otomatis oleh sistem kami. Namun dalam beberapa kejadian minor tabrakan checkout bersamaan, barang berhak diberikan ke nomor Invoice yang dibayarkan lunas terlebih dahulu (dengan garansi refund bagi pembatalan sistem).</p>
            <h3>Hak Kekayaan Intelektual</h3>
            <p>Konten foto, penulisan artikel, dan logo Saksag-Go! adalah sah dilindungi oleh hukum. Penggandaan karya komersial di platform e-commerce lain tanpa seizin tim, merupakan pelanggaran.</p>
          </>
        );
      case 'cookies':
        return (
          <>
            <p>Cookies adalah jejak rekam kecil dalam browser Anda yang dikumpulkan selama mengunjungi laman ini.</p>
            <h3>Manfaat Cookies bagi Pengalaman Anda</h3>
            <ul>
              <li><strong>Penyimpanan Keranjang:</strong> Barang yang Anda tambah ke keranjang seminggu lalu tetap ada bila Anda belum melakukan _clear cookies_.</li>
              <li><strong>Autentikasi Otomatis:</strong> Anda tidak perlu log masuk secara terus-menerus.</li>
              <li><strong>Personalisasi Produk:</strong> Koleksi Anak Laki/Perempuan direkomendasikan pada laman beranda berdasarkan kecenderungan klik terakhir Anda.</li>
            </ul>
            <p>Bila merasa terganggu, Anda bisa membersihkannya melalui setelah browser (Chrome/Safari) kapanpun sesuai preferensi privasi individual Anda.</p>
          </>
        );
      case 'blog':
        return (
          <>
            <p className="text-lg leading-relaxed text-[var(--text-secondary)] mb-8">
              Selamat datang di Jurnal <strong>Saksag-Go!</strong>. Sebuah sudut literasi di mana kami berbagi pandangan seputar pola asuh cerdas, memilih material ramah anak, serta merangkum tren pakaian yang nyaman dan tidak membatasi ruang gerak.
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
            
            <div className="mt-16 text-center">
              <button className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold rounded-full hover:bg-[var(--accent)] transition-colors shadow-lg">Muat Lebih Banyak Jurnal</button>
            </div>
          </>
        );
      case 'about':
        return (
          <>
            <div className="w-full relative rounded-3xl overflow-hidden mb-12 h-[350px] shadow-lg group">
              <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Tentang Saksag-Go!" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end justify-start p-10">
                 <div className="max-w-2xl text-left">
                   <h2 className="text-white text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-none mb-4 drop-shadow-xl font-serif italic">Merajut Cerita<br/>Sejak 2024</h2>
                   <p className="text-white/90 text-lg font-medium drop-shadow-md">Mengantarkan senyum di setiap jahitan pakaian pertama si buah hati.</p>
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
                  Saksag-Go! tidak lahir dari sekadar ambisi bisnis korporat. Perjalanan ini bermula dari kerisauan nyata seorang ibu muda di lorong panti asuhan pinggiran kota, yang kesulitan mencari pakaian sumbangan yang bukan sekadar 'murah', namun layak pakai, dan terbuat dari katun yang tidak menyakiti kulit sensitif bayi-bayi di sana. 
                </p>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mt-4">
                  Frustrasi akan dominasi pasar yang memprioritaskan "desain heboh" tapi mengesampingkan keamanan serat kimia baju tempelan, kami memberanikan diri merombak standar itu. Lewat modal awal yang sederhana, kami menggandeng tiga pengrajin garmen lokal di Jawa Barat yang setuju dengan satu prinsip kami: <strong>"Baju anak harus bisa 'bernapas', dan mereka harus leluasa berkeringat saat berlari menyelami dunia."</strong>
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border-color)] flex flex-col justify-center items-center text-center hover:bg-[var(--bg-primary)] hover:shadow-xl transition-all">
                  <h4 className="text-4xl font-black text-[var(--accent)] mb-2">50,000+</h4>
                  <p className="text-[var(--text-secondary)] font-medium">Baju Disalurkan (2024-2026)</p>
                </div>
                <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border-color)] flex flex-col justify-center items-center text-center hover:bg-[var(--bg-primary)] hover:shadow-xl transition-all">
                  <h4 className="text-4xl font-black text-[var(--accent)] mb-2">100%</h4>
                  <p className="text-[var(--text-secondary)] font-medium">Material Tersetifikasi Standar SNI</p>
                </div>
              </div>

              <section>
                 <div className="flex items-center gap-4 mb-6">
                   <span className="w-12 h-1 bg-purple-500 rounded-full"></span>
                   <h3 className="text-2xl font-black text-[var(--text-primary)] m-0">Tujuan Terbesar (Our Mission)</h3>
                </div>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  Misi dasar dari <strong>Saksag-Go!</strong> adalah melepaskan para orang tua dari kompromi antara harga dan kualitas. Kami mendedikasikan jam malam kami untuk melakukan pengetesan benang dan pola cuci, menekan biaya tengkulak, hingga menghasilkan purwarupa yang sempurna di mata anak, serta ramah di dompet keluarga.
                </p>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mt-4 font-bold italic text-[var(--text-primary)]">
                  "Sebab kami percaya penuh, dari pakaian yang tidak mengoyak dompet, lahir ketenangan ibu. Dan dari pakaian yang memeluk erat namun adem di kulit, lahir anak-anak hebat yang bebas berlari menebas rasa takutnya."
                </p>
              </section>

              <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 mt-12">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] m-0 mb-4">Mari Tumbuh Bersama</h3>
                 <p className="text-[var(--text-secondary)] mb-6">
                  Apabila Anda adalah seniman rajut lokal, distributor kapas organik, atau sekadar ibu yang ingin membagikan kisahnya kepada audiens kami, kanal komunikasi kami selalu terbuka secara profesional.
                 </p>
                 <a href="mailto:partnership@saksag-go.com" className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold px-6 py-3 rounded-xl hover:bg-[var(--accent)] transition-colors">
                    Mulai Kolaborasi <span className="text-xl">🤝</span>
                 </a>
              </section>
            </div>
          </>
        );
      default:
        return (
          <>
            <p>Halaman yang Anda tuju tidak ditemukan atau sedang dalam perbaikan sistem.</p>
            <Link to="/" className="text-[var(--mint-green)] font-semibold hover:underline">Kembali ke Beranda Utama</Link>
          </>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[50vh]">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-6">{getTitle()}</h1>
      <div className="prose text-[var(--text-secondary)] bg-[var(--bg-primary)] p-8 rounded-2xl border border-[var(--border-color)] shadow-sm leading-relaxed antialiased">
        {getContent()}
      </div>
    </div>
  );
}
