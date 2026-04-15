import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('📡 Mencoba login ke Supabase dengan email:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('❌ Login Error Details:', error);
        throw error;
      }

      if (data?.session) {
        console.log('✅ Login Berhasil, Sesi:', data.session);
        toast.success('Selamat datang, Admin!');
        navigate('/admin/dashboard');
      } else {
        throw new Error('Sesi tidak ditemukan setelah login.');
      }
    } catch (e: any) {
      console.error('❌ Catch Login Error:', e);
      toast.error('Gagal masuk: ' + (e.message || 'Periksa email dan password Anda.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
             <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GAKHA Cloud Admin</h1>
          <p className="text-gray-500 text-sm mt-2">Login Cloud Management System</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition-all"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Menghubungi Cloud...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
           Protected by Supabase Cloud Guard
        </p>
      </div>
    </div>
  );
}
