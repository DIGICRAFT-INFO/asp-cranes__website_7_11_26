'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, UserCheck } from 'lucide-react';

export default function ClientsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', logo: '', website: '', isActive: true, order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get('/clients/all').then(r => setItems(r.data.data)).catch(() => toast.error('Load failed')).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditItem(null); setForm({ name: '', logo: '', website: '', isActive: true, order: 0 }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm(item); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      if (editItem) {
        const r = await adminApi.put(`/clients/${editItem._id}`, form);
        setItems(prev => prev.map(i => i._id === editItem._id ? r.data.data : i));
        toast.success('Client updated!');
      } else {
        const r = await adminApi.post('/clients', form);
        setItems(prev => [...prev, r.data.data]);
        toast.success('Client added!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove client?')) return;
    try { await adminApi.delete(`/clients/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Removed'); }
    catch { toast.error('Delete failed'); }
  };

  const F = (k) => ({ value: form[k] || '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><UserCheck className="w-5 h-5 text-yellow-400" /> Our Clients</h1>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Client</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
        : items.length === 0 ? <div className="admin-card text-center py-16 text-slate-500"><UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No clients yet</p></div>
        : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => (
            <div key={item._id} className="admin-card p-4 flex flex-col items-center gap-3 group relative">
              <div className="w-16 h-12 flex items-center justify-center">
                {item.logo ? <img src={item.logo} alt={item.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                  : <span className="text-slate-400 text-xs text-center font-medium">{item.name}</span>}
              </div>
              <p className="text-slate-400 text-xs text-center truncate w-full">{item.name}</p>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="btn-ghost p-1"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item._id)} className="btn-danger p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="admin-label">Client Name *</label><input className="admin-input" {...F('name')} required /></div>
              <div>
                <label className="admin-label">Logo URL</label>
                <input className="admin-input" {...F('logo')} placeholder="https://..." />
                {form.logo && <img src={form.logo} alt="Preview" className="mt-2 h-12 object-contain" onError={e => e.target.style.display = 'none'} />}
              </div>
              <div><label className="admin-label">Website</label><input className="admin-input" {...F('website')} placeholder="https://..." /></div>
              <div><label className="admin-label">Order</label><input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({...f, order: Number(e.target.value)}))} /></div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : editItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


