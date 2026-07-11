'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import {
  Bell, X, Check, CheckCheck, ShieldCheck, ShieldOff,
  FileText, Settings, Info, Loader2
} from 'lucide-react';

const TYPE_CONFIG = {
  access_granted: { icon: ShieldCheck, color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
  access_revoked: { icon: ShieldOff, color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
  page_added: { icon: FileText, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  page_removed: { icon: FileText, color: '#facc15', bg: 'rgba(234,179,8,0.12)' },
  profile_updated: { icon: Settings, color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  system: { icon: Info, color: '#94a3b8', bg: 'rgba(100,116,139,0.12)' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await adminApi.get('/auth/notifications');
      setNotifications(res.data.data || []);
      setUnread(res.data.unreadCount || 0);
    } catch (e) { /* silent */ }
  }, []);

  // Poll every 30 seconds for real-time feel
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = async () => {
    try {
      await adminApi.put('/auth/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnread(0);
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  };

  const markRead = async (id) => {
    try {
      await adminApi.put(`/auth/notifications/${id}/read`);
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnread(u => Math.max(0, u - 1));
    } catch (e) { /* silent */ }
  };

  const handleToggle = () => {
    setOpen(o => !o);
    if (!open) fetchNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl transition-all"
        style={{
          background: open ? 'rgba(220,38,38,0.15)' : '#1e293b',
          border: open ? '1px solid rgba(220,38,38,0.3)' : '1px solid #334155',
          cursor: 'pointer',
          color: '#94a3b8',
        }}>
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: '#dc2626', boxShadow: '0 0 0 2px #0f172a' }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-96 rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: '#0f172a',
            border: '1px solid rgba(51,65,85,0.8)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            zIndex: 100,
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: '#ef4444' }} />
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unread > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(220,38,38,0.2)', color: '#f87171' }}>
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                  style={{ background: 'rgba(51,65,85,0.5)', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: '#94a3b8' }} />
                <p className="text-sm" style={{ color: '#475569' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-all"
                    style={{
                      borderBottom: '1px solid rgba(51,65,85,0.2)',
                      background: n.isRead ? 'transparent' : 'rgba(220,38,38,0.03)',
                    }}
                    onClick={() => !n.isRead && markRead(n._id)}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bg }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{n.title}</p>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: '#dc2626' }} />
                        )}
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#94a3b8' }}>{n.message}</p>
                      <p className="text-[10px] mt-1.5" style={{ color: '#475569' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 text-center"
              style={{ borderTop: '1px solid rgba(51,65,85,0.3)' }}>
              <p className="text-xs" style={{ color: '#334155' }}>Showing last {notifications.length} notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
