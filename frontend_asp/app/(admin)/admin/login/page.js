'use client';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldOff } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('superadmin@aspcranes.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revokedMsg, setRevokedMsg] = useState(false);
  const { setAuth, isAuthenticated, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (isAuthenticated) router.push('/admin/dashboard'); }, [isAuthenticated, router]);

  // Show revoke banner if redirected with ?reason=revoked
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'revoked') setRevokedMsg(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await adminApi.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth({ user, accessToken, refreshToken });
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden"
      style={{ background: '#020817' }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'rgba(220,38,38,0.1)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full" style={{ background: 'rgba(185,28,28,0.15)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-10 text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 border rounded-3xl shadow-2xl"
            style={{ background: '#1e293b', borderColor: '#334155' }}>
            <Image src="/companylogo.jpeg" alt="ASP Cranes" width={85} height={85} className="object-contain rounded-2xl" priority />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'white' }}>
            ASP <span style={{ color: '#ef4444' }}>Cranes</span>
          </h1>
          <p className="text-xs font-bold uppercase mt-1.5" style={{ color: '#64748b', letterSpacing: '0.2em' }}>Admin CMS Panel</p>
        </div>

        <div className="rounded-[28px] p-8 shadow-2xl"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>

          {/* Revoke Banner */}
          {revokedMsg && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl"
              style={{ background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <ShieldOff className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#fca5a5' }}>Access Revoked</p>
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                  Your account access has been revoked by the administrator. Please contact support.
                </p>
              </div>
            </div>
          )}

          <h2 className="mb-8 text-2xl font-bold" style={{ color: 'white' }}>Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="admin-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2" style={{ color: '#475569' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@aspcranes.com"
                  className="admin-input" style={{ paddingLeft: '3rem' }} required />
              </div>
            </div>
            <div>
              <label className="admin-label">Password</label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2" style={{ color: '#475569' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input" style={{ paddingLeft: '3rem', paddingRight: '3rem' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute -translate-y-1/2 right-4 top-1/2" style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center"
              style={{ height: '52px', borderRadius: '12px', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Launch Dashboard'}
            </button>
          </form>

          <div className="mt-8 p-5 rounded-2xl text-center"
            style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <p className="text-[10px] font-bold uppercase mb-3" style={{ color: '#64748b', letterSpacing: '0.2em' }}>System Credentials</p>
            <div className="space-y-2 font-mono text-[11px]">
              <p className="px-3 py-1.5 rounded-lg" style={{ color: '#cbd5e1', background: 'rgba(15,23,42,0.6)' }}>superadmin@aspcranes.com</p>
              <p className="px-3 py-1.5 rounded-lg" style={{ color: '#cbd5e1', background: 'rgba(15,23,42,0.6)' }}>admin@aspcranes.com</p>
              <p className="mt-2 font-bold" style={{ color: 'rgba(239,68,68,0.8)' }}>Pass: Admin@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
