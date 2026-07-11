'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import {
  User, Mail, Lock, Eye, EyeOff, Save, Loader2,
  ShieldCheck, Camera, KeyRound, AlertTriangle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  // Profile tab state
  const [profileForm, setProfileForm] = useState({ name: '', email: '', avatar: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password tab state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', avatar: user.avatar || '' });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name is required');
    if (!profileForm.email.trim()) return toast.error('Email is required');
    setProfileLoading(true);
    try {
      const res = await adminApi.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar,
      });
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) return toast.error('Current password required');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await adminApi.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'password', label: 'Change Password', icon: KeyRound },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <User className="w-5 h-5" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-sm" style={{ color: '#64748b' }}>Manage your account information</p>
          </div>
        </div>
      </div>

      {/* Avatar card */}
      <div className="rounded-2xl p-6 mb-6 flex items-center gap-5"
        style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)' }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: '#1e293b', border: '2px solid #0f172a' }}>
            <Camera className="w-3 h-3" style={{ color: '#94a3b8' }} />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-white">{user?.name}</p>
          <p className="text-sm" style={{ color: '#64748b' }}>{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="w-4 h-4" style={{ color: user?.role === 'superadmin' ? '#ef4444' : '#60a5fa' }} />
            <span className="text-xs font-bold uppercase" style={{
              color: user?.role === 'superadmin' ? '#ef4444' : '#60a5fa',
              letterSpacing: '0.1em'
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? '#dc2626' : 'rgba(30,41,59,0.6)',
                color: active ? 'white' : '#94a3b8',
                border: active ? 'none' : '1px solid rgba(51,65,85,0.5)',
                cursor: 'pointer',
                boxShadow: active ? '0 4px 14px rgba(220,38,38,0.3)' : 'none',
              }}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave}
          className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>

          <div>
            <label className="admin-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className="admin-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                className="admin-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Avatar URL <span style={{ color: '#475569', textTransform: 'none', fontSize: '0.7rem' }}>(optional)</span></label>
            <input
              type="url"
              value={profileForm.avatar}
              onChange={e => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
              className="admin-input"
              placeholder="https://..."
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </form>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSave}
          className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>

          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#facc15' }} />
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              After changing your password, you will remain logged in on this device. All other sessions will be invalidated on next token refresh.
            </p>
          </div>

          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="admin-label">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                <input
                  type={showPw[key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm'] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  className="admin-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder={placeholder}
                  required
                />
                <button type="button"
                  onClick={() => {
                    const k = key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm';
                    setShowPw(p => ({ ...p, [k]: !p[k] }));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                  {showPw[key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm']
                    ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : <><KeyRound className="w-4 h-4" /> Change Password</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
