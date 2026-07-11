'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, HelpCircle, UserCheck } from 'lucide-react';

// â”€â”€â”€ FAQs Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function FAQsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', order: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminApi.get('/faqs/all').then(r => setItems(r.data.data)).catch(() => toast.error('Load failed')).finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditItem(null); setForm({ question: '', answer: '', category: 'General', order: 0, isActive: true }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm(item); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question || !form.answer) return toast.error('Question and answer required');
    setSaving(true);
    try {
      if (editItem) {
        const r = await adminApi.put(`/faqs/${editItem._id}`, form);
        setItems(prev => prev.map(i => i._id === editItem._id ? r.data.data : i));
        toast.success('FAQ updated!');
      } else {
        const r = await adminApi.post('/faqs', form);
        setItems(prev => [...prev, r.data.data]);
        toast.success('FAQ created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete FAQ?')) return;
    try { await adminApi.delete(`/faqs/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><HelpCircle className="w-5 h-5 text-purple-400" /> FAQs</h1>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add FAQ</button>
      </div>
      <div className="space-y-3">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
          : items.length === 0 ? <div className="admin-card text-center py-16 text-slate-500"><HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No FAQs yet</p></div>
          : items.map((item, i) => (
          <div key={item._id} className="admin-card flex items-start gap-4">
            <span className="w-7 h-7 bg-red-600/20 text-red-400 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{item.question}</p>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{item.answer}</p>
              <span className="badge badge-blue mt-2 text-[10px]">{item.category}</span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(item)} className="btn-ghost p-1.5"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item._id)} className="btn-danger p-1.5"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="admin-label">Question *</label><input className="admin-input" value={form.question} onChange={e => setForm(f => ({...f, question: e.target.value}))} required /></div>
              <div><label className="admin-label">Answer *</label><textarea className="admin-input resize-none" rows={4} value={form.answer} onChange={e => setForm(f => ({...f, answer: e.target.value}))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="admin-label">Category</label><input className="admin-input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} /></div>
                <div><label className="admin-label">Order</label><input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({...f, order: Number(e.target.value)}))} /></div>
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

export default FAQsPage;


