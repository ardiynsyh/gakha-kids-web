import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { storeConfig } from '../../data/storeConfig';
import { toast } from 'sonner';
import { useState } from 'react';
import { Link } from 'react-router';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) {
      toast.error('Silakan masukkan alamat email Anda.');
      return;
    }
    toast.success(`Selesai! Terima kasih telah berlangganan dengan email ${email}.`);
    setEmail('');
  };
  return (
    <footer className="bg-[#0f172a] text-slate-300 pt-[clamp(3rem,8vw,5rem)] pb-[clamp(1.5rem,4vw,2.5rem)] font-sans w-full border-t border-slate-800">
      <div className="max-w-[1800px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
        
        {/* Fluid 4-Column Layout */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[clamp(2rem,5vw,3rem)] mb-[clamp(2.5rem,6vw,4rem)]">
          
          {/* Brand & Socials (Takes slightly more room if auto-fit expands) */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-1 rounded-lg shadow-sm">
                <img src="/logo.png" alt="Gakha Kids Logo" className="w-12 h-12 object-cover rounded-md" />
              </div>
              <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-black text-white tracking-tight flex items-center">
                {storeConfig.name.prefix}<span className="text-[var(--accent)]">{storeConfig.name.highlight}</span>
              </h3>
            </div>
            <p className="text-[clamp(0.85rem,1.5vw,0.95rem)] leading-relaxed mb-6 max-w-[300px] opacity-80">
              {storeConfig.footer.description}
            </p>
            <div className="flex gap-3 mt-6">
              <a href={storeConfig.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm hover:scale-110">
                <Facebook className="w-[18px] h-[18px]" />
              </a>
              <a href={storeConfig.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-all shadow-sm hover:scale-110">
                <Instagram className="w-[18px] h-[18px]" />
              </a>
              <a href={storeConfig.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm hover:scale-110">
                <Twitter className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="flex flex-col">
            <h4 className="text-[clamp(1rem,2vw,1.1rem)] font-bold text-white mb-5 uppercase tracking-wider">Toko</h4>
            <ul className="space-y-[clamp(0.5rem,1.5vw,0.75rem)]">
              {storeConfig.footer.shopLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-[clamp(0.85rem,1.5vw,0.95rem)] hover:text-[var(--accent)] hover:translate-x-1 inline-block transition-all opacity-80 hover:opacity-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col">
            <h4 className="text-[clamp(1rem,2vw,1.1rem)] font-bold text-white mb-5 uppercase tracking-wider">Layanan Pelanggan</h4>
            <ul className="space-y-[clamp(0.5rem,1.5vw,0.75rem)]">
              {storeConfig.footer.customerCareLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-[clamp(0.85rem,1.5vw,0.95rem)] hover:text-[var(--accent)] hover:translate-x-1 inline-block transition-all opacity-80 hover:opacity-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h4 className="text-[clamp(1rem,2vw,1.1rem)] font-bold text-white mb-5 uppercase tracking-wider">{storeConfig.footer.newsletterTitle}</h4>
            <p className="text-[clamp(0.85rem,1.5vw,0.95rem)] leading-relaxed mb-5 opacity-80">
              {storeConfig.footer.newsletterDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[400px]">
              <div className="flex-1 relative">
                <Mail className="absolute left-[clamp(12px,2vw,16px)] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={storeConfig.footer.newsletterPlaceholder}
                  className="w-full bg-slate-800 text-white pl-[clamp(2.5rem,4vw,3rem)] pr-4 py-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(0.85rem,1.5vw,0.95rem)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all shadow-inner"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
                />
              </div>
              <button 
                onClick={handleSubscribe}
                className="bg-[var(--accent)] text-white font-bold px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.6rem,1.5vw,0.75rem)] rounded-lg hover:bg-white hover:text-[#0f172a] text-[clamp(0.85rem,1.5vw,0.95rem)] transition-colors shadow-md shrink-0">
                {storeConfig.footer.newsletterButton}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-[clamp(1.5rem,4vw,2rem)] flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[clamp(0.75rem,1.5vw,0.85rem)] opacity-60">
            {storeConfig.footer.bottomText}
          </p>
          <div className="flex flex-wrap justify-center gap-[clamp(1rem,3vw,1.5rem)]">
            {storeConfig.footer.bottomLinks.map((link, i) => (
              <Link key={i} to={link.href} className="text-[clamp(0.75rem,1.5vw,0.85rem)] hover:text-[var(--accent)] opacity-60 hover:opacity-100 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
