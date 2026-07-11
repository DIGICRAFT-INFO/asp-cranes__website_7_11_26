'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import adminApi from '@/lib/adminApi';
import { useAuthStore } from '@/store/authStore';
import {
  Globe, Building2, Star, Wrench, FolderOpen, Newspaper,
  Briefcase, Tag, UserCheck, HelpCircle, Phone, Settings,
  LayoutDashboard, Cloud, Droplets, Wind, Thermometer,
  Eye as EyeIcon, Clock, CalendarDays, ChevronLeft,
  ChevronRight, ArrowRight, TrendingUp, Users,
} from 'lucide-react';

// ── Page meta map (key → label, icon, color, api endpoint) ──────────────────
const PAGE_META = {
  homepage:   { label: 'Homepage',    icon: Globe,      color: '#ef4444', api: '/homepage' },
  about:      { label: 'About Page',  icon: Building2,  color: '#f97316', api: null },
  cranes:     { label: 'Our Cranes',  icon: Star,       color: '#eab308', api: '/cranes/all' },
  services:   { label: 'Services',    icon: Wrench,     color: '#22c55e', api: '/services/all' },
  projects:   { label: 'Projects',    icon: FolderOpen, color: '#3b82f6', api: '/projects/all' },
  blogs:      { label: 'Blog Posts',  icon: Newspaper,  color: '#a855f7', api: '/blogs/all' },
  careers:    { label: 'Careers',     icon: Briefcase,  color: '#f59e0b', api: '/careers/all' },
  categories: { label: 'Categories',  icon: Tag,        color: '#06b6d4', api: '/categories/all' },
  clients:    { label: 'Our Clients', icon: UserCheck,  color: '#10b981', api: '/clients/all' },
  faqs:       { label: 'FAQs',        icon: HelpCircle, color: '#8b5cf6', api: '/faqs/all' },
  contacts:   { label: 'Contacts',    icon: Phone,      color: '#0d9488', api: '/contact' },
  settings:   { label: 'Settings',    icon: Settings,   color: '#64748b', api: null },
};

const ALL_PAGE_KEYS = Object.keys(PAGE_META);
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Live Clock + Calendar ────────────────────────────────────────────────────
function ClockCalendar() {
  const [now, setNow] = useState(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    const d = new Date();
    setNow(d);
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now || !view) return <div className="admin-card animate-pulse h-64" />;

  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i)=>i+1)];
  const isCurMonth = now.getFullYear() === year && now.getMonth() === month;

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}>
      {/* Time */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <Clock className="w-5 h-5" style={{ color: '#ef4444' }} />
        </div>
        <div>
          <p className="text-2xl font-black text-white tracking-tight font-mono">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
          <p className="text-xs" style={{ color: '#64748b' }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setView(new Date(year, month-1, 1))}
          className="btn-ghost p-1" style={{ padding: '4px' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-white flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" style={{ color: '#94a3b8' }} />
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => setView(new Date(year, month+1, 1))}
          className="btn-ghost p-1" style={{ padding: '4px' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((w,i) => (
          <div key={i} className="text-center text-[10px] font-bold pb-1" style={{ color: '#475569' }}>{w}</div>
        ))}
        {cells.map((d, i) => {
          const isToday = isCurMonth && d === now.getDate();
          const isSun = (i % 7) === 0;
          return (
            <div key={i} className="text-center text-xs py-1.5 rounded-lg font-medium"
              style={{
                color: !d ? 'transparent' : isToday ? '#fff' : isSun ? '#f87171' : '#94a3b8',
                background: isToday ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'transparent',
                boxShadow: isToday ? '0 2px 8px rgba(220,38,38,0.4)' : 'none',
                fontWeight: isToday ? 800 : 400,
              }}>
              {d || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Weather Widget (Raipur — Open-Meteo, no API key needed) ─────────────────
const WMO_CODES = {
  0:'Clear Sky', 1:'Mainly Clear', 2:'Partly Cloudy', 3:'Overcast',
  45:'Foggy', 48:'Icy Fog', 51:'Light Drizzle', 53:'Drizzle',
  61:'Light Rain', 63:'Rain', 65:'Heavy Rain',
  71:'Light Snow', 73:'Snow', 75:'Heavy Snow',
  80:'Showers', 81:'Rain Showers', 82:'Violent Showers',
  95:'Thunderstorm', 96:'Thunderstorm+Hail', 99:'Severe Thunderstorm',
};

const WMO_ICON = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌧️', 61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'❄️', 73:'❄️', 75:'❄️', 80:'🌦️', 81:'🌧️', 82:'⛈️',
  95:'⛈️', 96:'⛈️', 99:'⛈️',
};

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Raipur lat/lon
    const lat = 21.2514, lon = 81.6296;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode,apparent_temperature,visibility&wind_speed_unit=kmh&timezone=Asia%2FKolkata`)
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          feels: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          wind: Math.round(c.wind_speed_10m),
          code: c.weathercode,
          visibility: Math.round((c.visibility || 0) / 1000),
        });
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="rounded-2xl p-5 animate-pulse h-full"
      style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}>
      <div className="h-4 w-24 rounded mb-3" style={{ background: '#1e293b' }} />
      <div className="h-10 w-16 rounded" style={{ background: '#1e293b' }} />
    </div>
  );

  if (error || !weather) return (
    <div className="rounded-2xl p-5 h-full flex items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}>
      <p className="text-xs" style={{ color: '#475569' }}>Weather unavailable</p>
    </div>
  );

  const icon = WMO_ICON[weather.code] ?? '🌡️';
  const desc = WMO_CODES[weather.code] ?? 'Unknown';

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)', border: '1px solid rgba(51,65,85,0.6)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase" style={{ color: '#64748b', letterSpacing: '0.15em' }}>📍 Raipur, CG</p>
          <p className="text-sm font-semibold text-white mt-0.5">Live Weather</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      {/* Temp */}
      <div>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black text-white">{weather.temp}°</span>
          <span className="text-lg font-medium mb-2" style={{ color: '#94a3b8' }}>C</span>
        </div>
        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>{desc}</p>
        <p className="text-xs mt-1" style={{ color: '#475569' }}>Feels like {weather.feels}°C</p>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, color: '#60a5fa' },
          { icon: Wind, label: 'Wind', value: `${weather.wind} km/h`, color: '#34d399' },
          { icon: EyeIcon, label: 'Visibility', value: `${weather.visibility} km`, color: '#a78bfa' },
          { icon: Thermometer, label: 'Feels Like', value: `${weather.feels}°C`, color: '#fb923c' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl"
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.3)' }}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-[10px]" style={{ color: '#475569' }}>{label}</p>
              <p className="text-xs font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center" style={{ color: '#334155' }}>
        Powered by Open-Meteo • Updates on load
      </p>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, icon: Icon, color, href, count, index }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.3, delay: index*0.04 }}>
      <Link href={href} style={{ textDecoration:'none' }}>
        <div className="group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(51,65,85,0.5)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ background: color + '22', border: `1px solid ${color}44` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-black text-white">{count ?? '—'}</p>
            <p className="text-xs truncate" style={{ color: '#64748b' }}>{label}</p>
          </div>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            style={{ color: '#475569' }} />
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();
  const [counts, setCounts] = useState({});
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === 'superadmin';
  const allowedPages = isSuperAdmin ? ALL_PAGE_KEYS : (user?.allowedPages || []);

  // Fetch counts only for pages user has access to
  const fetchData = useCallback(async () => {
    if (!user) return;
    const pagesWithApi = allowedPages.filter(k => PAGE_META[k]?.api);
    const results = await Promise.allSettled(
      pagesWithApi.map(k => adminApi.get(PAGE_META[k].api))
    );
    const c = {};
    pagesWithApi.forEach((k, i) => {
      const val = results[i];
      if (val.status === 'fulfilled') {
        const data = val.value?.data?.data;
        c[k] = Array.isArray(data) ? data.length : '—';
        if (k === 'contacts' && Array.isArray(data)) {
          setRecentContacts(data.slice(0, 5));
        }
      }
    });
    setCounts(c);
    setLoading(false);
  }, [user, allowedPages.join(',')]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stat cards filtered by access
  const visibleCards = allowedPages
    .filter(k => PAGE_META[k])
    .map((k, i) => ({
      key: k,
      label: PAGE_META[k].label,
      icon: PAGE_META[k].icon,
      color: PAGE_META[k].color,
      href: `/admin/${k}`,
      count: counts[k] ?? (loading ? '…' : '—'),
      index: i,
    }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>{greeting()} 👋</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            Welcome, <span style={{ color: '#ef4444' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#475569' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: isSuperAdmin ? '#ef4444' : '#60a5fa' }} />
            {isSuperAdmin ? 'Superadmin — Full Access' : `Admin — ${allowedPages.length} page${allowedPages.length !== 1 ? 's' : ''} accessible`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {allowedPages.slice(0,3).map(k => {
            const m = PAGE_META[k]; if (!m) return null;
            const Icon = m.icon;
            return (
              <Link key={k} href={`/admin/${k}`} style={{ textDecoration:'none' }}>
                <button className="btn-secondary text-xs flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {m.label}
                </button>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* No Access State */}
      {!loading && allowedPages.length === 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="rounded-2xl p-10 text-center"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-white mb-2">No Pages Assigned</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>Contact the superadmin to get access to pages.</p>
        </motion.div>
      )}

      {/* Stat Cards Grid */}
      {visibleCards.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase mb-3" style={{ color: '#334155', letterSpacing: '0.15em' }}>
            Content Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleCards.map(c => <StatCard key={c.key} {...c} />)}
          </div>
        </div>
      )}

      {/* Bottom 3-column grid: Calendar | Weather | Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <ClockCalendar />

        {/* Weather */}
        <WeatherWidget />

        {/* Recent Contacts or Access Info */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35, delay:0.1 }}
          className="rounded-2xl p-5 flex flex-col"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4" style={{ color: '#2dd4bf' }} /> Recent Enquiries
            </h2>
            {allowedPages.includes('contacts') && (
              <Link href="/admin/contacts" className="text-xs" style={{ color: '#f87171', textDecoration: 'none' }}>
                View All →
              </Link>
            )}
          </div>
          {!allowedPages.includes('contacts') ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <div className="text-3xl mb-3">🔒</div>
              <p className="text-sm font-medium" style={{ color: '#475569' }}>Contacts not accessible</p>
              <p className="text-xs mt-1" style={{ color: '#334155' }}>No access to this section</p>
            </div>
          ) : recentContacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-center py-6" style={{ color: '#64748b' }}>No enquiries yet</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {recentContacts.map(c => (
                <div key={c._id} className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.3)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(13,148,136,0.2)', color: '#2dd4bf' }}>
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                      {!c.isRead && <span className="badge badge-red text-[9px]">New</span>}
                    </div>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: '#64748b' }}>{c.message}</p>
                  </div>
                  <p className="text-[9px] flex-shrink-0 mt-1" style={{ color: '#334155' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Superadmin extra: quick access panel */}
      {isSuperAdmin && (
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35, delay:0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: '#ef4444' }} /> All Content Sections
            </h2>
            <Link href="/admin/admins" style={{ textDecoration:'none' }}>
              <button className="btn-secondary text-xs">Manage Admins →</button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {ALL_PAGE_KEYS.map(k => {
              const m = PAGE_META[k]; if (!m) return null;
              const Icon = m.icon;
              return (
                <Link key={k} href={`/admin/${k}`} style={{ textDecoration:'none' }}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all cursor-pointer"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = m.color + '15'; e.currentTarget.style.borderColor = m.color + '44'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; e.currentTarget.style.borderColor = 'rgba(51,65,85,0.3)'; }}>
                    <Icon className="w-5 h-5" style={{ color: m.color }} />
                    <span className="text-[10px] font-medium text-center leading-tight" style={{ color: '#94a3b8' }}>{m.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
