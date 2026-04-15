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
    <div className="min-h-screen bg-[#f1f8e9] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003300 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 border border-[#b9f6ca]/30 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#003300]" />
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#003300] border-4 border-white shadow-xl text-white flex items-center justify-center mx-auto mb-6 text-4xl font-black italic">G</div>
          <h1 className="text-4xl font-black text-[#001a00] italic tracking-tighter uppercase leading-none">GAKHA<span className="text-[#2e7d32]">MARKET</span></h1>
          <p className="text-[#2e7d32] text-[9px] font-black uppercase tracking-[0.4em] mt-3">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Admin Identity</label>
            <input 
              type="email" 
              className="w-full bg-gray-50 border-b-2 border-transparent focus:border-[#2e7d32] p-4 rounded-2xl outline-none font-bold text-sm transition-all"
              placeholder="admin@gakha.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Security Key</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-b-2 border-transparent focus:border-[#2e7d32] p-4 rounded-2xl outline-none font-bold text-sm transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#003300] text-white font-black py-5 rounded-3xl text-[11px] uppercase tracking-[0.4em] hover:bg-[#2e7d32] transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Decrypting Access...' : 'Enter Dashboard'}
          </button>
        </form>

        <p className="mt-12 text-center text-[8px] text-gray-400 uppercase tracking-[0.4em] font-black">
           GAKHA CORE — SECURITY VERified
        </p>
      </div>
    </div>
  );
}
