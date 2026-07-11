'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Phone, Search, Trash2, CheckCircle, Mail, Loader2, Eye } from 'lucide-react';

export default function ContactsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    try { const r = await adminApi.get('/contact'); setItems(r.data.data); }
    catch { toast.error('Failed to load contacts'); }
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase())
  );

  const markRead = async (item) => {
    try {
      const r = await adminApi.put(`/contact/${item._id}`, { isRead: true });
      setItems(prev => prev.map(i => i._id === item._id ? r.data.data : i));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try { await adminApi.delete(`/contact/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); setSelected(null); }
    catch { toast.error('Delete failed'); }
  };

  const unread = items.filter(i => !i.isRead).length;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-400" /> Contact Enquiries
            {unread > 0 && <span className="badge badge-red ml-1">{unread} new</span>}
          </h1>
          <p className="text-slate-400 text-xs">{items.length} total submissions</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="admin-input pl-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 admin-card p-0 overflow-hidden">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-400" /></div>
            : filtered.length === 0 ? <div className="text-center py-16 text-slate-500"><Phone className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No contacts found</p></div>
            : <div className="divide-y divide-slate-700/40">
              {filtered.map(item => (
                <div key={item._id} onClick={() => { setSelected(item); markRead(item); }}
                  className={`p-4 cursor-pointer hover:bg-slate-700/30 transition-colors ${selected?._id === item._id ? 'bg-slate-700/40 border-l-2 border-red-500' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        {!item.isRead && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-slate-400 text-xs truncate">{item.email}</p>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-1">{item.message}</p>
                    </div>
                    <p className="text-slate-600 text-[10px] flex-shrink-0">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="admin-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg">{selected.name}</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{selected.email}</p>
                  {selected.phone && <p className="text-slate-400 text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{selected.phone}</p>}
                </div>
                <button onClick={() => handleDelete(selected._id)} className="btn-danger p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
              {selected.inquiry && (
                <div>
                  <p className="admin-label">Inquiry Type</p>
                  <span className="badge badge-blue">{selected.inquiry}</span>
                </div>
              )}
              <div>
                <p className="admin-label">Message</p>
                <div className="bg-slate-900/60 rounded-lg p-4 text-slate-300 text-sm leading-relaxed border border-slate-700/40">
                  {selected.message}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-700/40">
                <p>Received: {new Date(selected.createdAt).toLocaleString()}</p>
                {selected.isRead && <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3.5 h-3.5" />Read</span>}
              </div>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.inquiry || 'Your enquiry'}&body=Dear ${selected.name},%0A%0A`}
                className="btn-primary w-full justify-center">
                <Mail className="w-4 h-4" /> Reply via Email
              </a>
            </div>
          ) : (
            <div className="admin-card flex items-center justify-center h-full min-h-48">
              <div className="text-center text-slate-500">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a contact to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


