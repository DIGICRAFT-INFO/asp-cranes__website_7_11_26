'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, Loader2, Star, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import MediaManager from '@/components/admin/MediaManager';
import CategoryChecklist from '@/components/admin/CategoryChecklist';

const CATEGORIES = ['tower', 'truck-mounted', 'crawler', 'pick-carry', 'awp', 'trailer', 'other'];

const emptyForm = {
  name: '', subtitle: '', description: '', image: '', images: [], attachments: [], badge: 'PREMIUM FLEET',
  category: 'tower', categories: [], isActive: true, isFeatured: false, order: 0,
  specs: '', features: '',
};

export default function CranesPage() {
  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCranes = async () => {
    try {
      const res = await adminApi.get('/cranes/all');
      setCranes(res.data.data);
    } catch (e) { toast.error('Failed to load cranes'); }
    setLoading(false);
  };

  useEffect(() => { fetchCranes(); }, []);

  const filtered = cranes.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || c.category === filter;
    return matchSearch && matchFilter;
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (crane) => {
    setEditItem(crane);
    setForm({
      ...crane,
      images: crane.images?.length ? crane.images : (crane.image ? [crane.image] : []),
      attachments: crane.attachments || [],
      categories: (crane.categories || []).map(c => c._id || c),
      specs: Object.entries(crane.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
      features: (crane.features || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      // Parse specs from text
      const specsObj = {};
      if (form.specs) {
        form.specs.split('\n').filter(Boolean).forEach(line => {
          const [k, ...v] = line.split(':');
          if (k && v.length) specsObj[k.trim()] = v.join(':').trim();
        });
      }
      const featuresArr = form.features ? form.features.split('\n').filter(Boolean) : [];
      const payload = { ...form, specs: specsObj, features: featuresArr };

      if (editItem) {
        const res = await adminApi.put(`/cranes/${editItem._id}`, payload);
        setCranes(prev => prev.map(c => c._id === editItem._id ? res.data.data : c));
        toast.success('Crane updated!');
      } else {
        const res = await adminApi.post('/cranes', payload);
        setCranes(prev => [res.data.data, ...prev]);
        toast.success('Crane created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this crane?')) return;
    try {
      await adminApi.delete(`/cranes/${id}`);
      setCranes(prev => prev.filter(c => c._id !== id));
      toast.success('Crane deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (crane) => {
    try {
      const res = await adminApi.put(`/cranes/${crane._id}`, { isActive: !crane.isActive });
      setCranes(prev => prev.map(c => c._id === crane._id ? res.data.data : c));
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-red-400" /> Our Cranes</h1>
          <p className="text-slate-400 text-xs mt-0.5">{cranes.length} total cranes</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Crane</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cranes..." className="admin-input pl-9" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="admin-input w-40">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-red-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No cranes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Crane</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Featured</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(crane => (
                  <tr key={crane._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {crane.image && (
                          <img src={crane.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-slate-700" />
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{crane.name}</p>
                          <p className="text-slate-500 text-xs truncate max-w-48">{crane.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-blue capitalize">{crane.category}</span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => toggleActive(crane)} className="flex items-center gap-1.5">
                        {crane.isActive
                          ? <><ToggleRight className="w-5 h-5 text-green-400" /><span className="badge badge-green">Active</span></>
                          : <><ToggleLeft className="w-5 h-5 text-slate-500" /><span className="badge badge-red">Inactive</span></>
                        }
                      </button>
                    </td>
                    <td className="table-cell">
                      {crane.isFeatured ? <span className="badge badge-yellow">Featured</span> : <span className="text-slate-600 text-xs">â€”</span>}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(crane)} className="btn-ghost p-1.5" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(crane._id)} className="btn-danger p-1.5" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Crane' : 'Add New Crane'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="admin-label">Crane Name *</label>
                  <input className="admin-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Tower Crane" required />
                </div>
                <div>
                  <label className="admin-label">Subtitle</label>
                  <input className="admin-input" value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))} placeholder="Short tagline" />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select className="admin-input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <CategoryChecklist
                    type="crane"
                    selected={form.categories}
                    onChange={(ids) => setForm(f => ({ ...f, categories: ids }))}
                    label="Additional Tags (optional)"
                  />
                </div>
                <div className="col-span-2">
                  <MediaManager
                    images={form.images}
                    onImagesChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                    attachments={form.attachments}
                    onAttachmentsChange={(atts) => setForm(f => ({ ...f, attachments: atts }))}
                    imagesLabel="Crane Images"
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Description</label>
                  <textarea className="admin-input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe this crane..." />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Specifications (one per line: Key: Value)</label>
                  <textarea className="admin-input resize-none font-mono text-xs" rows={4} value={form.specs} onChange={e => setForm(f => ({...f, specs: e.target.value}))} placeholder={"Lifting Capacity: 350 MT\nBoom Length: 63 Mtr\nModel: Hammerhead"} />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Features (one per line)</label>
                  <textarea className="admin-input resize-none" rows={3} value={form.features} onChange={e => setForm(f => ({...f, features: e.target.value}))} placeholder={"High load capacity\nStable on rough terrain"} />
                </div>
                <div>
                  <label className="admin-label">Badge Text</label>
                  <input className="admin-input" value={form.badge} onChange={e => setForm(f => ({...f, badge: e.target.value}))} placeholder="PREMIUM FLEET" />
                </div>
                <div>
                  <label className="admin-label">Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({...f, order: Number(e.target.value)}))} />
                </div>
                <div className="flex items-center gap-6 col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="rounded" />
                    <span className="text-slate-300 text-sm">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="rounded" />
                    <span className="text-slate-300 text-sm">Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (editItem ? 'Update Crane' : 'Create Crane')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


