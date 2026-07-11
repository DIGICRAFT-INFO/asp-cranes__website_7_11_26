'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import {
  Users, Plus, Trash2, ShieldCheck, ShieldOff, Edit3,
  Loader2, X, Save, Eye, EyeOff, CheckSquare, Square,
  Calendar, Mail, User, Lock, RefreshCw, Shield
} from 'lucide-react';

const ALL_PAGES = [
  { key: 'homepage', label: 'Homepage' },
  { key: 'about', label: 'About Page' },
  { key: 'cranes', label: 'Our Cranes' },
  { key: 'services', label: 'Services' },
  { key: 'projects', label: 'Projects' },
  { key: 'blogs', label: 'Blog Posts' },
  { key: 'careers', label: 'Careers' },
  { key: 'categories', label: 'Categories' },
  { key: 'clients', label: 'Our Clients' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'settings', label: 'Settings' },
];

const EMPTY_FORM = { name: '', email: '', password: '', allowedPages: [] };

export default function AdminsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Redirect if not superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.push('/admin/dashboard');
      toast.error('Superadmin access only');
    }
  }, [user, router]);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/auth/admins');
      setAdmins(res.data.data);
    } catch (err) {
      console.error('Fetch admins error:', err.response?.status, err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  // Wait for auth to be ready before fetching
  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchAdmins();
    }
  }, [user, fetchAdmins]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal('create');
    setShowPw(false);
  };

  const openEdit = (admin) => {
    setForm({
      name: admin.name,
      email: admin.email,
      password: '',
      allowedPages: [...(admin.allowedPages || [])],
    });
    setEditTarget(admin);
    setModal('edit');
    setShowPw(false);
  };

  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const togglePage = (pageKey) => {
    setForm(f => ({
      ...f,
      allowedPages: f.allowedPages.includes(pageKey)
        ? f.allowedPages.filter(p => p !== pageKey)
        : [...f.allowedPages, pageKey],
    }));
  };

  const selectAllPages = () => setForm(f => ({ ...f, allowedPages: ALL_PAGES.map(p => p.key) }));
  const clearAllPages = () => setForm(f => ({ ...f, allowedPages: [] }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return toast.error('Name, email and password are required');
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await adminApi.post('/auth/admins', form);
      toast.success('Admin created successfully!');
      closeModal();
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error('Name and email required');
    if (form.password && form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, allowedPages: form.allowedPages };
      if (form.password) payload.password = form.password;
      await adminApi.put(`/auth/admins/${editTarget._id}`, payload);
      toast.success('Admin updated!');
      closeModal();
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (admin) => {
    if (!confirm(`Revoke access for ${admin.name}? They will be immediately logged out.`)) return;
    setActionLoading(p => ({ ...p, [admin._id]: 'revoke' }));
    try {
      await adminApi.put(`/auth/admins/${admin._id}/revoke`);
      toast.success(`Access revoked for ${admin.name}`);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke access');
    } finally {
      setActionLoading(p => ({ ...p, [admin._id]: null }));
    }
  };

  const handleGrant = async (admin) => {
    setActionLoading(p => ({ ...p, [admin._id]: 'grant' }));
    try {
      await adminApi.put(`/auth/admins/${admin._id}/grant`);
      toast.success(`Access restored for ${admin.name}`);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grant access');
    } finally {
      setActionLoading(p => ({ ...p, [admin._id]: null }));
    }
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Permanently delete ${admin.name}? This cannot be undone.`)) return;
    setActionLoading(p => ({ ...p, [admin._id]: 'delete' }));
    try {
      await adminApi.delete(`/auth/admins/${admin._id}`);
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading(p => ({ ...p, [admin._id]: null }));
    }
  };

  if (user?.role !== 'superadmin') return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <Users className="w-5 h-5" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Management</h1>
            <p className="text-sm" style={{ color: '#64748b' }}>Manage admin accounts & page access permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAdmins} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> New Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Admins', value: admins.length, color: '#60a5fa' },
          { label: 'Active', value: admins.filter(a => a.isActive).length, color: '#4ade80' },
          { label: 'Revoked', value: admins.filter(a => !a.isActive).length, color: '#f87171' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4"
            style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: '#64748b' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#dc2626' }} />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#94a3b8' }} />
            <p style={{ color: '#64748b' }}>No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Admin', 'Role', 'Pages', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin._id} className="transition-colors"
                    style={{ background: !admin.isActive ? 'rgba(127,29,29,0.05)' : 'transparent' }}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                          style={{
                            background: admin.role === 'superadmin'
                              ? 'linear-gradient(135deg, #dc2626, #f87171)'
                              : 'linear-gradient(135deg, #1e40af, #60a5fa)',
                          }}>
                          {admin.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{admin.name}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${admin.role === 'superadmin' ? 'badge-red' : 'badge-blue'}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {admin.role}
                      </span>
                    </td>
                    <td className="table-cell" style={{ maxWidth: '200px' }}>
                      {admin.role === 'superadmin' ? (
                        <span className="text-xs" style={{ color: '#4ade80' }}>All pages</span>
                      ) : (admin.allowedPages || []).length === 0 ? (
                        <span className="text-xs" style={{ color: '#f87171' }}>No access</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(admin.allowedPages || []).slice(0, 3).map(p => (
                            <span key={p} className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>
                              {p}
                            </span>
                          ))}
                          {(admin.allowedPages || []).length > 3 && (
                            <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(51,65,85,0.5)', color: '#64748b' }}>
                              +{admin.allowedPages.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${admin.isActive ? 'badge-green' : 'badge-red'}`}>
                        {admin.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" style={{ color: '#475569' }} />
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" style={{ color: '#475569' }} />
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {admin.role !== 'superadmin' && (
                        <div className="flex items-center gap-2">
                          {/* Edit */}
                          <button onClick={() => openEdit(admin)} title="Edit"
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'none', cursor: 'pointer' }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Grant / Revoke */}
                          {admin.isActive ? (
                            <button
                              onClick={() => handleRevoke(admin)}
                              disabled={actionLoading[admin._id] === 'revoke'}
                              title="Revoke Access"
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', cursor: 'pointer' }}>
                              {actionLoading[admin._id] === 'revoke'
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <ShieldOff className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGrant(admin)}
                              disabled={actionLoading[admin._id] === 'grant'}
                              title="Grant Access"
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'none', cursor: 'pointer' }}>
                              {actionLoading[admin._id] === 'grant'
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <ShieldCheck className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(admin)}
                            disabled={actionLoading[admin._id] === 'delete'}
                            title="Delete Admin"
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(127,29,29,0.3)', color: '#fca5a5', border: 'none', cursor: 'pointer' }}>
                            {actionLoading[admin._id] === 'delete'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                      {admin.role === 'superadmin' && (
                        <span className="text-xs" style={{ color: '#475569' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-2xl animate-fade-in overflow-hidden"
            style={{ background: '#0f172a', border: '1px solid rgba(51,65,85,0.8)', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  {modal === 'create' ? <Plus className="w-4 h-4" style={{ color: '#ef4444' }} /> : <Edit3 className="w-4 h-4" style={{ color: '#ef4444' }} />}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {modal === 'create' ? 'Create New Admin' : `Edit: ${editTarget?.name}`}
                </h2>
              </div>
              <button onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={modal === 'create' ? handleCreate : handleUpdate} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="admin-label">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="admin-input" style={{ paddingLeft: '2.5rem' }} placeholder="Admin's full name" required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="admin-label">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="admin-input" style={{ paddingLeft: '2.5rem' }} placeholder="admin@example.com" required />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="admin-label">
                  {modal === 'create' ? 'Password *' : 'New Password'}{' '}
                  {modal === 'edit' && <span style={{ color: '#475569', textTransform: 'none', fontSize: '0.7rem' }}>(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="admin-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder={modal === 'create' ? 'Min. 6 characters' : '••••••••'}
                    required={modal === 'create'} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Page Access */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="admin-label" style={{ marginBottom: 0 }}>Page Access Permissions</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAllPages}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'none', cursor: 'pointer' }}>
                      Select All
                    </button>
                    <button type="button" onClick={clearAllPages}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(51,65,85,0.5)', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PAGES.map(page => {
                    const checked = form.allowedPages.includes(page.key);
                    return (
                      <button
                        key={page.key}
                        type="button"
                        onClick={() => togglePage(page.key)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                        style={{
                          background: checked ? 'rgba(220,38,38,0.12)' : 'rgba(15,23,42,0.6)',
                          border: checked ? '1px solid rgba(220,38,38,0.35)' : '1px solid rgba(51,65,85,0.5)',
                          color: checked ? '#fca5a5' : '#94a3b8',
                          cursor: 'pointer',
                        }}>
                        {checked
                          ? <CheckSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
                          : <Square className="w-4 h-4 flex-shrink-0" style={{ color: '#475569' }} />}
                        <span className="font-medium">{page.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs mt-2" style={{ color: '#475569' }}>
                  {form.allowedPages.length} of {ALL_PAGES.length} pages selected
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> {modal === 'create' ? 'Create Admin' : 'Save Changes'}</>}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
