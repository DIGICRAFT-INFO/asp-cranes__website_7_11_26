'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

// Checklist-style multi-select for tagging a Crane/Service/Project/Blog item
// with any number of admin-managed categories (M:M relationship — a
// category can apply to many items, an item can carry many categories).
// `selected` / `onChange` work with an array of category IDs.
export default function CategoryChecklist({ type, selected = [], onChange, label = 'Categories' }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    adminApi.get('/categories/all', { params: { type } })
      .then(r => mounted && setOptions(r.data.data.filter(c => c.isActive)))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [type]);

  const selectedIds = selected.map(s => (typeof s === 'string' ? s : s._id));

  const toggle = (id) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(s => s !== id));
    else onChange([...selectedIds, id]);
  };

  return (
    <div>
      <label className="admin-label">{label}</label>
      {loading ? (
        <div className="flex items-center gap-2 text-xs py-2" style={{ color: '#64748b' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading categories...
        </div>
      ) : options.length === 0 ? (
        <p className="text-xs" style={{ color: '#64748b' }}>
          No categories yet. <Link href="/admin/categories" className="underline" style={{ color: '#a78bfa' }}>Add some in Categories</Link>.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map(opt => {
            const checked = selectedIds.includes(opt._id);
            return (
              <label
                key={opt._id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition select-none"
                style={{
                  background: checked ? 'rgba(124,58,237,0.2)' : 'rgba(51,65,85,0.4)',
                  color: checked ? '#c4b5fd' : '#94a3b8',
                  border: `1px solid ${checked ? 'rgba(124,58,237,0.5)' : 'transparent'}`,
                }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(opt._id)} className="hidden" />
                <Tag className="w-3 h-3" />
                {opt.name}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
