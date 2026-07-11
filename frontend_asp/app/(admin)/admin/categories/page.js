'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Loader2, Tag, ToggleLeft, ToggleRight, X } from 'lucide-react';

const TYPES = [
  { value: 'crane', label: 'Cranes' },
  { value: 'service', label: 'Services' },
  { value: 'project', label: 'Projects' },
  { value: 'blog', label: 'Blog Posts' },
];

export default function CategoriesPage() {
  const [activeType, setActiveType] = useState('crane');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = async (type) => {
    setLoading(true);
    try {
      const r = await adminApi.get('/categories/all', { params: { type } });
      setItems(r.data.data);
    } catch { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(activeType); }, [activeType]);

  const openCreate = () => { setEditItem(null); setName(''); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setName(item.name); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editItem) {
        const r = await adminApi.put(`/categories/${editItem._id}`, { name: name.trim() });
        setItems(prev => prev.map(i => i._id === editItem._id ? r.data.data : i));
        toast.success('Category updated!');
      } else {
        const r = await adminApi.post('/categories', { name: name.trim(), type: activeType });
        setItems(prev => [...prev, r.data.data]);
        toast.success('Category created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Items already tagged with it will simply lose that tag.')) return;
    try { await adminApi.delete(`/categories/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (item) => {
    try {
      const r = await adminApi.put(`/categories/${item._id}`, { isActive: !item.isActive });
      setItems(prev => prev.map(i => i._id === item._id ? r.data.data : i));
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Tag className="w-5 h-5 text-purple-400" /> Categories</h1>
          <p className="text-slate-400 text-xs">
            Manage tag lists used across Cranes, Services, Projects, and Blog Posts. An item can carry any number of these.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition"
            style={{
              background: activeType === t.value ? '#7c3aed' : 'rgba(51,65,85,0.4)',
              color: activeType === t.value ? '#fff' : '#94a3b8',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No {TYPES.find(t => t.value === activeType)?.label.toLowerCase()} categories yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead><tr>
              <th className="table-header">Name</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr></thead>
            <tbody>{items.map(item => (
              <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                <td className="table-cell text-white text-sm font-medium">{item.name}</td>
                <td className="table-cell">
                  <button onClick={() => toggleActive(item)} className="flex items-center gap-1.5">
                    {item.isActive ? <><ToggleRight className="w-5 h-5 text-green-400" /><span className="badge badge-green">Active</span></> : <><ToggleLeft className="w-5 h-5 text-slate-500" /><span className="badge badge-red">Inactive</span></>}
                  </button>
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(item)} className="btn-ghost p-1.5"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item._id)} className="btn-danger p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Category' : `Add ${TYPES.find(t => t.value === activeType)?.label} Category`}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="admin-label">Category Name *</label>
                <input className="admin-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Featured, New Arrival" autoFocus required />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
