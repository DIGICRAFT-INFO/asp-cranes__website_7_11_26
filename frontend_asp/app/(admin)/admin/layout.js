'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/Sidebar';
import NotificationsPanel from '@/components/admin/NotificationsPanel';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, init, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { init(); }, []);

  // Handle ?reason=revoked on login page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'revoked') {
        toast.error('Your account access has been revoked by the administrator.', { duration: 6000 });
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // RBAC: check if current path is accessible
  useEffect(() => {
    if (!user || !isAuthenticated || pathname === '/admin/login' || pathname === '/admin/dashboard') return;
    if (user.role === 'superadmin') return;

    // Extract page key from pathname  e.g. /admin/homepage → homepage
    const match = pathname.match(/^\/admin\/([^/]+)/);
    const pageKey = match?.[1];
    if (!pageKey || pageKey === 'profile' || pageKey === 'dashboard') return;

    const allowed = user.allowedPages || [];
    if (!allowed.includes(pageKey)) {
      toast.error(`You don't have access to this page.`);
      router.replace('/admin/dashboard');
    }
  }, [pathname, user, isAuthenticated, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (isLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{ background: '#020817' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full animate-pulse"
          style={{ background: 'rgba(220,38,38,0.2)', filter: 'blur(120px)' }} />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full animate-spin"
              style={{ borderColor: '#1e293b', borderTopColor: '#dc2626' }} />
            <ShieldCheck className="absolute w-6 h-6 text-red-500 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold tracking-widest text-white uppercase">ASP Cranes</p>
            <p className="text-[10px] mt-1 font-medium italic" style={{ color: '#475569' }}>Verifying session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ background: '#0f172a' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="lg:ml-[280px]">
          {/* Topbar */}
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8"
            style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl transition-all"
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer' }}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="items-center hidden gap-2 lg:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 8px #ef4444' }} />
              <p className="text-xs font-bold uppercase" style={{ color: '#94a3b8', letterSpacing: '0.15em' }}>
                Admin <span style={{ color: '#475569', margin: '0 4px' }}>/</span>
                <span style={{ color: 'white' }}>CMS Panel</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all"
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#334155'; }}
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                <span className="hidden sm:inline">View Site</span>
              </a>

              {/* Notifications Bell (functional) */}
              <NotificationsPanel />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
              <div className="pb-12">{children}</div>
            </div>
          </main>

          {/* Footer */}
          <footer className="px-8 py-4 flex justify-between items-center"
            style={{ borderTop: '1px solid rgba(255,255,255,0.02)', background: 'rgba(15,23,42,0.5)' }}>
            <p className="text-[10px] font-medium" style={{ color: '#334155' }}>
              © 2025 ASP CRANES • INTERNAL SYSTEMS
            </p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-50 animate-pulse" />
          </footer>
        </div>
      </div>
    </div>
  );
}
