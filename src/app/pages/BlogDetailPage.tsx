import { useParams, Link } from 'react-router';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react';
import blogPosts from '../../data/blogPosts.json';

export function BlogDetailPage() {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Artikel Tidak Ditemukan</h2>
        <Link to="/page/blog" className="text-[var(--accent)] hover:underline mt-4 inline-block">Kembali ke Blog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back Button */}
      <Link to="/page/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[var(--accent)] transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        KEMBALI KE BLOG
      </Link>

      {/* Hero Section */}
      <div className="mb-10 text-center">
         <div className="inline-block bg-[var(--bg-secondary)] text-[var(--accent)] text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest mb-6">
           {post.category}
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] leading-tight mb-8">
            {post.title}
         </h1>
         <div className="flex items-center justify-center gap-6 text-sm text-[var(--text-secondary)] font-medium">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {post.readTime}</div>
         </div>
      </div>

      <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl">
         <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
      </div>

      {/* Content Container */}
      <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 md:p-16 shadow-xl border border-gray-100 dark:border-gray-800 -mt-24 relative z-10 mx-auto max-w-3xl">
         <div 
           dangerouslySetInnerHTML={{ __html: post.content }} 
           className="prose prose-lg dark:prose-invert max-w-none 
           prose-headings:text-[var(--text-primary)] prose-headings:font-black 
           prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
           prose-strong:text-[var(--accent)] prose-ul:text-[var(--text-secondary)]" 
         />
         
         <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)] font-bold italic">S</div>
               <div>
                  <div className="text-sm font-black text-[var(--text-primary)]">Saksag-Go! Editorial Team</div>
                  <div className="text-xs text-[var(--text-secondary)]">Berbagi cerita tumbuh kembang si kecil.</div>
               </div>
            </div>
            <button className="flex items-center gap-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] px-6 py-3 rounded-2xl font-bold hover:bg-[var(--accent)] hover:text-white transition-all">
               <Share2 className="w-4 h-4" /> Bagikan Artikel
            </button>
         </div>
      </div>

      {/* Suggested Reading */}
      <div className="mt-20">
         <h2 className="text-2xl font-black text-center mb-10">Mungkin Anda Suka</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.filter(p => p.id !== post.id).map(p => (
              <Link key={p.id} to={`/blog/${p.id}`} className="group bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
                 <h3 className="font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">{p.title}</h3>
                 <p className="text-xs text-gray-500 line-clamp-2">{p.excerpt}</p>
                 <div className="mt-4 text-[var(--accent)] text-xs font-black uppercase tracking-tighter">Baca Sekarang &rarr;</div>
              </Link>
            ))}
         </div>
      </div>
    </div>
  );
}
