'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, Loader2, Newspaper, ToggleLeft, ToggleRight } from 'lucide-react';
import MediaManager from '@/components/admin/MediaManager';
import CategoryChecklist from '@/components/admin/CategoryChecklist';

const emptyForm = {
  title: '', subtitle: '', excerpt: '', content: '', image: '', images: [], attachments: [], categories: [], imageCaption: '',
  category: '', tags: '', author: 'ASP Cranes Team',
  isPublished: true, isFeatured: false, readTime: 5,
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await adminApi.get('/blogs/all');
      setBlogs(res.data.data);
      const cats = [...new Set(res.data.data.map(b => b.category).filter(Boolean))];
      setCategories(cats);
    } catch (e) { toast.error('Failed to load blogs'); }
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const filtered = blogs.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || b.category === filterCat;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (blog) => {
    setEditItem(blog);
    setForm({
      ...blog,
      images: blog.images?.length ? blog.images : (blog.image ? [blog.image] : []),
      attachments: blog.attachments || [],
      categories: (blog.categories || []).map(c => c._id || c),
      tags: (blog.tags || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.category.trim()) return toast.error('Category is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        const res = await adminApi.put(`/blogs/${editItem._id}`, payload);
        setBlogs(prev => prev.map(b => b._id === editItem._id ? res.data.data : b));
        toast.success('Blog updated!');
      } else {
        const res = await adminApi.post('/blogs', payload);
        setBlogs(prev => [res.data.data, ...prev]);
        toast.success('Blog created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await adminApi.delete(`/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b._id !== id));
      toast.success('Blog deleted');
    } catch { toast.error('Delete failed'); }
  };

  const togglePublished = async (blog) => {
    try {
      const res = await adminApi.put(`/blogs/${blog._id}`, { isPublished: !blog.isPublished });
      setBlogs(prev => prev.map(b => b._id === blog._id ? res.data.data : b));
    } catch { toast.error('Update failed'); }
  };

  const F = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });
  const FC = (key) => ({ checked: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.checked })) });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Newspaper className="w-5 h-5 text-green-400" /> Blog Posts</h1>
          <p className="text-slate-400 text-xs mt-0.5">{blogs.length} total posts</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Post</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input {...F('search')} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blogs..." className="admin-input pl-9" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="admin-input w-44">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-green-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No blog posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Author</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Views</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(blog => (
                  <tr key={blog._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {blog.image && <img src={blog.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-slate-700" />}
                        <div>
                          <p className="text-white text-sm font-medium line-clamp-1">{blog.title}</p>
                          <p className="text-slate-500 text-xs line-clamp-1 max-w-56">{blog.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-blue">{blog.category}</span>
                    </td>
                    <td className="table-cell text-slate-400 text-xs">{blog.author}</td>
                    <td className="table-cell">
                      <button onClick={() => togglePublished(blog)} className="flex items-center gap-1.5">
                        {blog.isPublished
                          ? <><ToggleRight className="w-5 h-5 text-green-400" /><span className="badge badge-green">Published</span></>
                          : <><ToggleLeft className="w-5 h-5 text-slate-500" /><span className="badge badge-yellow">Draft</span></>}
                      </button>
                    </td>
                    <td className="table-cell text-slate-400 text-xs">{blog.views || 0}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(blog)} className="btn-ghost p-1.5"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(blog._id)} className="btn-danger p-1.5"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Blog Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="admin-label">Title *</label>
                  <input className="admin-input" {...F('title')} placeholder="Blog post title" required />
                </div>
                <div>
                  <label className="admin-label">Category *</label>
                  <input className="admin-input" {...F('category')} placeholder="e.g. Safety, Fleet, Innovation" required />
                </div>
                <div>
                  <label className="admin-label">Author</label>
                  <input className="admin-input" {...F('author')} placeholder="Author name" />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Subtitle</label>
                  <input className="admin-input" {...F('subtitle')} placeholder="Short subtitle" />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Excerpt / Short Description</label>
                  <textarea className="admin-input resize-none" rows={2} {...F('excerpt')} placeholder="Brief description shown in listing..." />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Full Content</label>
                  <textarea className="admin-input resize-none" rows={6} {...F('content')} placeholder="Full blog post content (HTML or plain text)..." />
                </div>
                <div className="col-span-2">
                  <MediaManager
                    images={form.images}
                    onImagesChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                    attachments={form.attachments}
                    onAttachmentsChange={(atts) => setForm(f => ({ ...f, attachments: atts }))}
                    imagesLabel="Cover & Gallery Images"
                  />
                </div>
                <div className="col-span-2">
                  <CategoryChecklist
                    type="blog"
                    selected={form.categories}
                    onChange={(ids) => setForm(f => ({ ...f, categories: ids }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Tags (comma-separated)</label>
                  <input className="admin-input" {...F('tags')} placeholder="safety, crane, construction" />
                </div>
                <div>
                  <label className="admin-label">Read Time (minutes)</label>
                  <input type="number" className="admin-input" value={form.readTime} onChange={e => setForm(f => ({...f, readTime: Number(e.target.value)}))} min={1} />
                </div>
                <div className="flex items-center gap-6 col-span-1 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...FC('isPublished')} className="rounded" />
                    <span className="text-slate-300 text-sm">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...FC('isFeatured')} className="rounded" />
                    <span className="text-slate-300 text-sm">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : editItem ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


