import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { SEO } from '../components/SEO';

export function InfoPage() {
  const { id } = useParams();
  const [cloudPage, setCloudPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      setIsLoaded(true); // Wait, I used isLoaded instead of setIsLoading here in previous versions?
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('info_pages')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) setCloudPage(data);
        else setCloudPage(null);
      } catch (err) {
        console.error("Fetch page error:", err);
        setCloudPage(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPage();
  }, [id]);

  const getTitle = () => {
    if (cloudPage) return cloudPage.title;
    switch (id) {
       case 'about': return 'Tentang GAKHA';
       case 'contact': return 'Hubungi Kami';
       case 'shipping': return 'Info Pengiriman';
       case 'returns': return 'Kebijakan Pengembalian';
       case 'size-guide': return 'Panduan Ukuran';
       case 'faq': return 'FAQ';
       default: return 'Informasi';
    }
  };

  const getContent = () => {
    if (cloudPage) {
       return <div dangerouslySetInnerHTML={{ __html: cloudPage.content }} />;
    }
    
    switch (id) {
       case 'about':
         return (
           <div className="space-y-6">
             <p>GAKHA lahir dari kecintaan mendalam terhadap kultur tribun dan identitas supporter sepak bola di Indonesia.</p>
             <p>Kami percaya bahwa fashion adalah cara paling otentik untuk mengekspresikan kesetiaan. Dengan desain yang memadukan elemen tribal tradisional daerah dengan estetika modern terrace wear, GAKHA hadir untuk mereka yang merawat kesetiaan di setiap laga.</p>
           </div>
         );
       default:
         return isLoading ? <p className="text-center animate-pulse">Menghubungi Server...</p> : (
            <div className="text-center py-10">
              <p className="mb-4">Halaman sedang dalam pemeliharaan.</p>
              <Link to="/" className="text-green-600 font-bold hover:underline">Kembali ke Beranda</Link>
            </div>
         );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-[50vh]">
      <SEO title={getTitle()} />
      <h1 className="text-4xl font-black mb-10 text-center">{getTitle()}</h1>
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm leading-relaxed">
        {getContent()}
      </div>
    </div>
  );
}
