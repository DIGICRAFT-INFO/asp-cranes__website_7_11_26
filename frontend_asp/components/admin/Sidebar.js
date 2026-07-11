'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Settings, HelpCircle, ChevronRight, LogOut, Globe,
  Newspaper, Wrench, UserCheck, Building2, Star, FolderOpen, Phone,
  Briefcase, Tag, Users, UserCircle, Lock
} from 'lucide-react';

// Map page keys → nav items
const PAGE_NAV_MAP = {
  homepage:   { label: 'Homepage',    href: '/admin/homepage',    icon: Globe },
  about:      { label: 'About Page',  href: '/admin/about',       icon: Building2 },
  cranes:     { label: 'Our Cranes',  href: '/admin/cranes',      icon: Star },
  services:   { label: 'Services',    href: '/admin/services',    icon: Wrench },
  projects:   { label: 'Projects',    href: '/admin/projects',    icon: FolderOpen },
  blogs:      { label: 'Blog Posts',  href: '/admin/blogs',       icon: Newspaper },
  careers:    { label: 'Careers',     href: '/admin/careers',     icon: Briefcase },
  categories: { label: 'Categories',  href: '/admin/categories',  icon: Tag },
  clients:    { label: 'Our Clients', href: '/admin/clients',     icon: UserCheck },
  faqs:       { label: 'FAQs',        href: '/admin/faqs',        icon: HelpCircle },
  contacts:   { label: 'Contacts',    href: '/admin/contacts',    icon: Phone },
  settings:   { label: 'Settings',    href: '/admin/settings',    icon: Settings },
};

const ALL_PAGE_KEYS = Object.keys(PAGE_NAV_MAP);

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isSuperAdmin = user?.role === 'superadmin';

  // Determine which pages to show in sidebar
  const allowedPageKeys = isSuperAdmin
    ? ALL_PAGE_KEYS
    : (user?.allowedPages || []).filter(k => ALL_PAGE_KEYS.includes(k));

  const handleLogout = async () => {
    try { await adminApi.post('/auth/logout'); } catch (e) {}
    logout();
    toast.success('Logged out');
    router.push('/admin/login');
  };

  const NavLink = ({ href, icon: Icon, label, badge }) => {
    const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={onClose}
        className="group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
        style={{
          background: active ? '#dc2626' : 'transparent',
          color: active ? 'white' : '#94a3b8',
          boxShadow: active ? '0 4px 14px rgba(220,38,38,0.3)' : 'none',
          textDecoration: 'none',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? 'white' : '#64748b' }} />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
            style={{ background: 'rgba(220,38,38,0.3)', color: '#fca5a5' }}>
            {badge}
          </span>
        )}
        {active ? (
          <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 8px rgba(255,255,255,0.8)' }} />
        ) : (
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#64748b' }} />
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(2,8,23,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: '280px', background: '#000', borderRight: '1px solid rgba(255,255,255,0.05)', boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center px-6 py-8">
          <div className="relative w-full h-14 hover:scale-105 transition-transform duration-300">
            <Image src="/companylogo.jpeg" alt="ASP Cranes" fill className="object-contain rounded-lg" priority />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
          {/* Dashboard — always visible */}
          <NavLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {/* Divider */}
          <div className="py-1">
            <div className="h-px mx-2" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>

          {/* Content pages — filtered by RBAC */}
          {allowedPageKeys.length === 0 && !isSuperAdmin ? (
            <div className="px-4 py-6 text-center">
              <Lock className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: '#94a3b8' }} />
              <p className="text-xs" style={{ color: '#475569' }}>No pages assigned yet.</p>
              <p className="text-xs mt-1" style={{ color: '#334155' }}>Contact superadmin.</p>
            </div>
          ) : (
            allowedPageKeys.map(key => {
              const item = PAGE_NAV_MAP[key];
              if (!item) return null;
              return <NavLink key={key} href={item.href} icon={item.icon} label={item.label} />;
            })
          )}

          {/* Superadmin-only section */}
          {isSuperAdmin && (
            <>
              <div className="py-1">
                <div className="h-px mx-2" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <p className="text-[10px] font-bold uppercase px-4 pt-3 pb-1" style={{ color: '#334155', letterSpacing: '0.15em' }}>
                  Superadmin
                </p>
              </div>
              <NavLink href="/admin/admins" icon={Users} label="Admin Management" badge="SA" />
            </>
          )}
        </nav>

        {/* User + Profile + Logout */}
        <div className="p-4">
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* User info — clickable → profile */}
            <Link href="/admin/profile" onClick={onClose}
              className="flex items-center gap-3 mb-4 rounded-xl p-2 transition-all group"
              style={{ textDecoration: 'none', margin: '-0.5rem -0.5rem 0.5rem -0.5rem' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)' }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 rounded-full"
                  style={{ borderColor: '#0a0f1e' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[11px] font-medium uppercase truncate" style={{ color: '#64748b', letterSpacing: '0.1em' }}>
                  {user?.role || 'admin'}
                </p>
              </div>
              <UserCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#64748b' }} />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-300"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.05em', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
