import { Link } from 'react-router';
import { Instagram, Twitter, Facebook, MessageCircle, Heart, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const TikTokIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-5 h-5"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function Footer() {
  const { config } = useStore();
  const year = new Date().getFullYear();

  const socialLinks = [
    { name: 'Instagram', 
      icon: <Instagram className="w-5 h-5" />, 
      href: config?.socialMedia?.instagram || '#' 
    },
    { name: 'TikTok', 
      icon: <TikTokIcon />, 
      href: config?.socialMedia?.tiktok || '#' 
    },
    { name: 'WhatsApp', 
      icon: <Phone className="w-5 h-5" />, 
      href: `https://wa.me/${config?.socialMedia?.resellerWhatsApp}` || '#' 
    },
    { name: 'Facebook', 
      icon: <Facebook className="w-5 h-5" />, 
      href: config?.socialMedia?.facebook || '#' 
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-[clamp(1rem,5vw,4rem)] font-sans">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        {/* Brand Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
             <span className="font-black text-2xl tracking-tighter text-[var(--text-primary)] font-serif italic uppercase">
                {config?.name?.prefix}<span className="text-[var(--accent)]">{config?.name?.highlight}</span>
             </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed pr-4">
             Destinasi utama untuk fashion anak yang ceria, nyaman, dan berkualitas tinggi. Kami percaya setiap anak layak mendapatkan pakaian terbaik.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Belanja Berdasarkan Kategori</h4>
          <ul className="space-y-3">
            <li><Link to="/shop/new" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Koleksi Terbaru</Link></li>
            <li><Link to="/shop/boys" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Anak Laki-Laki</Link></li>
            <li><Link to="/shop/girls" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Anak Perempuan</Link></li>
            <li><Link to="/shop/sale" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Penawaran Spesial</Link></li>
          </ul>
        </div>

        {/* Help & Info */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Bantuan & Informasi</h4>
          <ul className="space-y-3">
            <li><Link to="/page/shipping" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Informasi Pengiriman</Link></li>
            <li><Link to="/page/returns" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Kebijakan Pengembalian</Link></li>
            <li><Link to="/page/reseller" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Program Reseller</Link></li>
            <li><Link to="/page/about" className="text-gray-500 hover:text-[var(--accent)] text-sm transition-colors">Tentang Gakha Kids</Link></li>
          </ul>
        </div>

        {/* Newsletter / Contact */}
        <div className="space-y-6">
          <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Butuh Bantuan?</h4>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <MessageCircle className="w-5 h-5 text-[var(--accent)]" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hubungi via Chat</p>
                <a href={`https://wa.me/${config?.socialMedia?.resellerWhatsApp}`} className="text-sm font-bold text-gray-900 hover:text-[var(--accent)] transition-colors">WhatsApp Customer Service</a>
             </div>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-400">Jam Operasional: Senin - Sabtu (08:00 - 18:00 WIB)</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-gray-400 text-xs flex items-center gap-1.5">
          &copy; {year} {config?.name?.prefix}{config?.name?.highlight}. Dibuat dengan <Heart className="w-3 h-3 text-red-400 fill-red-400" /> untuk anak Indonesia.
        </p>
        <div className="flex items-center gap-8">
           <Link to="/page/privacy" className="text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600 transition-colors tracking-widest">Privacy Policy</Link>
           <Link to="/page/terms" className="text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600 transition-colors tracking-widest">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
