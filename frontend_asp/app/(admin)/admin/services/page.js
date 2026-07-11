'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, Loader2, Wrench, ToggleLeft, ToggleRight } from 'lucide-react';
import MediaManager from '@/components/admin/MediaManager';
import CategoryChecklist from '@/components/admin/CategoryChecklist';

const emptyForm = { title: '', subtitle: '', description: '', image: '', images: [], attachments: [], categories: [], icon: '', isActive: true, isFeatured: false, order: 0, features: '' };

export default function ServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try { const r = await adminApi.get('/services/all'); setItems(r.data.data); }
    catch { toast.error('Failed to load services'); }
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const filtered = items.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      images: item.images?.length ? item.images : (item.image ? [item.image] : []),
      attachments: item.attachments || [],
      categories: (item.categories || []).map(c => c._id || c),
      features: (item.features || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    setSaving(true);
    try {
      const payload = { ...form, features: form.features ? form.features.split('\n').filter(Boolean) : [] };
      if (editItem) {
        const r = await adminApi.put(`/services/${editItem._id}`, payload);
        setItems(prev => prev.map(i => i._id === editItem._id ? r.data.data : i));
        toast.success('Service updated!');
      } else {
        const r = await adminApi.post('/services', payload);
        setItems(prev => [r.data.data, ...prev]);
        toast.success('Service created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await adminApi.delete(`/services/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (item) => {
    try { const r = await adminApi.put(`/services/${item._id}`, { isActive: !item.isActive }); setItems(prev => prev.map(i => i._id === item._id ? r.data.data : i)); }
    catch { toast.error('Update failed'); }
  };

  const F = (k) => ({ value: form[k] || '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });
  const FC = (k) => ({ checked: !!form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.checked })) });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Wrench className="w-5 h-5 text-orange-400" /> Services</h1>
          <p className="text-slate-400 text-xs">{items.length} total services</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Service</button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="admin-input pl-9" />
      </div>
      <div className="admin-card overflow-hidden p-0">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div> :
          filtered.length === 0 ? <div className="text-center py-16 text-slate-500"><Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No services found</p></div> :
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Service</th>
                <th className="table-header">Order</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(item => (
                <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-700" />}
                      <div>
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-slate-500 text-xs line-clamp-1 max-w-64">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-slate-400 text-xs">{item.order}</td>
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
          </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="admin-label">Title *</label>
                <input className="admin-input" {...F('title')} required placeholder="Service title" />
              </div>
              <div>
                <label className="admin-label">Subtitle</label>
                <input className="admin-input" {...F('subtitle')} placeholder="Short tagline" />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea className="admin-input resize-none" rows={3} {...F('description')} placeholder="Service description..." />
              </div>
              <div>
                <MediaManager
                  images={form.images}
                  onImagesChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                  attachments={form.attachments}
                  onAttachmentsChange={(atts) => setForm(f => ({ ...f, attachments: atts }))}
                  imagesLabel="Service Images"
                />
              </div>
              <div>
                <CategoryChecklist
                  type="service"
                  selected={form.categories}
                  onChange={(ids) => setForm(f => ({ ...f, categories: ids }))}
                />
              </div>
              <div>
                <label className="admin-label">Features (one per line)</label>
                <textarea className="admin-input resize-none" rows={3} {...F('features')} placeholder={"Safe operations\nCertified operators"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({...f, order: Number(e.target.value)}))} />
                </div>
                <div className="flex items-center gap-6 pt-5">
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


