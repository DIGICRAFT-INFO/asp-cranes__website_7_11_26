'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Settings, Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get('/settings').then(r => setData(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/settings', data);
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const set = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const I = (path, placeholder = '') => ({
    value: path.split('.').reduce((o, k) => o?.[k], data) || '',
    onChange: e => set(path, e.target.value),
    className: 'admin-input',
    placeholder,
  });

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-red-400" /></div>;
  if (!data) return null;

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" /> Site Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Settings</>}
        </button>
      </div>

      {/* General */}
      <div className="admin-card space-y-4">
        <h3 className="text-white font-semibold border-b border-slate-700/40 pb-2">General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="admin-label">Site Name</label><input {...I('siteName', 'ASP Cranes')} /></div>
          <div><label className="admin-label">Tagline</label><input {...I('tagline')} /></div>
          <div><label className="admin-label">Contact Email</label><input type="email" {...I('email')} /></div>
          <div><label className="admin-label">Logo URL</label><input {...I('logo')} /></div>
        </div>
        <div>
          <label className="admin-label">Phone Numbers (comma-separated)</label>
          <input
            className="admin-input"
            value={(data.phone || []).join(', ')}
            onChange={e => set('phone', e.target.value.split(',').map(p => p.trim()).filter(Boolean))}
            placeholder="+91-20-66744700, +966 59 705 9690"
          />
        </div>
        <div><label className="admin-label">Address</label><input {...I('address')} /></div>
      </div>

      {/* Social Links */}
      <div className="admin-card space-y-4">
        <h3 className="text-white font-semibold border-b border-slate-700/40 pb-2">Social Links</h3>
        {['linkedin', 'facebook', 'instagram', 'twitter', 'youtube'].map(sn => (
          <div key={sn}>
            <label className="admin-label capitalize">{sn}</label>
            <input {...I(`socialLinks.${sn}`, `https://${sn}.com/...`)} />
          </div>
        ))}
      </div>

      {/* SEO */}
      <div className="admin-card space-y-4">
        <h3 className="text-white font-semibold border-b border-slate-700/40 pb-2">SEO</h3>
        <div><label className="admin-label">Meta Title</label><input {...I('seo.metaTitle')} /></div>
        <div><label className="admin-label">Meta Description</label><textarea className="admin-input resize-none" rows={3} {...I('seo.metaDescription')} /></div>
        <div>
          <label className="admin-label">Keywords (comma-separated)</label>
          <input
            className="admin-input"
            value={(data.seo?.keywords || []).join(', ')}
            onChange={e => set('seo.keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
          />
        </div>
      </div>

      {/* Admin management (superadmin only) */}
      <div className="admin-card space-y-4">
        <h3 className="text-white font-semibold border-b border-slate-700/40 pb-2">Account</h3>
        <p className="text-slate-400 text-sm">To change your password or manage admin accounts, contact the Super Admin.</p>
        <a href="/admin/dashboard" className="btn-secondary inline-flex">â† Back to Dashboard</a>
      </div>

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save All Settings</>}
        </button>
      </div>
    </div>
  );
}


