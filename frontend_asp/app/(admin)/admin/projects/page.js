'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, Loader2, FolderOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import MediaManager from '@/components/admin/MediaManager';
import CategoryChecklist from '@/components/admin/CategoryChecklist';

const emptyForm = { title: '', subtitle: '', description: '', image: '', images: [], attachments: [], categories: [], category: '', client: '', location: '', year: new Date().getFullYear(), isActive: true, isFeatured: false, order: 0 };

export default function ProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const r = await adminApi.get('/projects/all');
      setItems(r.data.data);
      setCategories([...new Set(r.data.data.map(p => p.category).filter(Boolean))]);
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const filtered = items.filter(i => {
    const ms = !search || i.title.toLowerCase().includes(search.toLowerCase());
    const mc = !filterCat || i.category === filterCat;
    return ms && mc;
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      images: item.images?.length ? item.images : (item.image ? [item.image] : []),
      attachments: item.attachments || [],
      categories: (item.categories || []).map(c => c._id || c),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim()) return toast.error('Title and category required');
    setSaving(true);
    try {
      if (editItem) {
        const r = await adminApi.put(`/projects/${editItem._id}`, form);
        setItems(prev => prev.map(i => i._id === editItem._id ? r.data.data : i));
        toast.success('Project updated!');
      } else {
        const r = await adminApi.post('/projects', form);
        setItems(prev => [r.data.data, ...prev]);
        toast.success('Project created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await adminApi.delete(`/projects/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const F = (k) => ({ value: form[k] || '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });
  const FC = (k) => ({ checked: !!form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.checked })) });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><FolderOpen className="w-5 h-5 text-blue-400" /> Projects</h1>
          <p className="text-slate-400 text-xs">{items.length} total projects</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Project</button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="admin-input pl-9" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="admin-input w-44">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="admin-card overflow-hidden p-0">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          : filtered.length === 0 ? <div className="text-center py-16 text-slate-500"><FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No projects found</p></div>
          : <div className="overflow-x-auto"><table className="w-full">
            <thead><tr>
              <th className="table-header">Project</th>
              <th className="table-header">Category</th>
              <th className="table-header">Location</th>
              <th className="table-header">Year</th>
              <th className="table-header text-right">Actions</th>
            </tr></thead>
            <tbody>{filtered.map(item => (
              <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    {item.image && <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-700" />}
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-slate-500 text-xs">{item.client}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell"><span className="badge badge-blue">{item.category}</span></td>
                <td className="table-cell text-slate-400 text-xs">{item.location}</td>
                <td className="table-cell text-slate-400 text-xs">{item.year}</td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(item)} className="btn-ghost p-1.5"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item._id)} className="btn-danger p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="admin-label">Title *</label><input className="admin-input" {...F('title')} required /></div>
                <div><label className="admin-label">Category *</label><input className="admin-input" {...F('category')} required placeholder="Infrastructure, Energy..." /></div>
                <div><label className="admin-label">Client</label><input className="admin-input" {...F('client')} /></div>
                <div><label className="admin-label">Location</label><input className="admin-input" {...F('location')} /></div>
                <div><label className="admin-label">Year</label><input type="number" className="admin-input" value={form.year} onChange={e => setForm(f => ({...f, year: Number(e.target.value)}))} /></div>
                <div className="col-span-2">
                  <MediaManager
                    images={form.images}
                    onImagesChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                    attachments={form.attachments}
                    onAttachmentsChange={(atts) => setForm(f => ({ ...f, attachments: atts }))}
                    imagesLabel="Project Images"
                  />
                </div>
                <div className="col-span-2">
                  <CategoryChecklist
                    type="project"
                    selected={form.categories}
                    onChange={(ids) => setForm(f => ({ ...f, categories: ids }))}
                  />
                </div>
                <div className="col-span-2"><label className="admin-label">Description</label><textarea className="admin-input resize-none" rows={3} {...F('description')} /></div>
                <div className="flex items-center gap-6 col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...FC('isActive')} className="rounded" /><span className="text-slate-300 text-sm">Active</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...FC('isFeatured')} className="rounded" /><span className="text-slate-300 text-sm">Featured</span></label>
                </div>
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


