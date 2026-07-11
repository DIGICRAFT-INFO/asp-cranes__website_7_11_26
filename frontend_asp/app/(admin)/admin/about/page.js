'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Building2, Save, Loader2, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-card overflow-hidden p-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/20 transition-colors">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-700/40 pt-4 space-y-4">{children}</div>}
    </div>
  );
};

export default function AboutAdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get('/about').then(r => setData(r.data.data || {})).catch(() => toast.error('Load failed')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/about', data);
      toast.success('About page updated! Changes live on website.');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const set = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const get = (path) => path.split('.').reduce((o, k) => o?.[k], data) || '';

  const I = (path, placeholder = '') => ({
    value: get(path),
    onChange: e => set(path, e.target.value),
    className: 'admin-input',
    placeholder,
  });

  const addToArray = (path, item) => {
    const arr = get(path) || [];
    set(path, [...arr, item]);
  };

  const removeFromArray = (path, idx) => {
    const arr = get(path) || [];
    set(path, arr.filter((_, i) => i !== idx));
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-red-400" /></div>;

  return (
    <div className="animate-fade-in space-y-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" /> About Page Editor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">All changes reflect live on the About Us page</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
        </button>
      </div>

      {/* Section 1 */}
      <Section title="Main About Section (Left column â€” image, title, bullets)" defaultOpen>
        <div><label className="admin-label">Tagline (small red text)</label><input {...I('section1.tagline', 'ABOUT US')} /></div>
        <div><label className="admin-label">Main Title (BIG UPPERCASE)</label><input {...I('section1.title', 'WE BUILD EVERYTHING THAT YOU NEED')} /></div>
        <div>
          <label className="admin-label">Description Paragraph</label>
          <textarea className="admin-input resize-none" rows={4} value={get('section1.paragraphs.0') || ''} onChange={e => set('section1.paragraphs', [e.target.value])} placeholder="Main description paragraph..." />
        </div>
        <div>
          <label className="admin-label">Highlight Bullets (Safety First, Integrity etc. â€” one per line)</label>
          <textarea className="admin-input resize-none" rows={5}
            value={(data?.section1?.highlights || []).join('\n')}
            onChange={e => set('section1.highlights', e.target.value.split('\n').filter(Boolean))}
            placeholder={"Safety First\nIntegrity & Transparency\nProfessional Excellence\nCustomer Commitment\nContinuous Improvement"}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="admin-label">Button Text</label><input {...I('section1.btnText', 'About Us')} /></div>
          <div><label className="admin-label">Button Link</label><input {...I('section1.btnLink', '/contact')} /></div>
        </div>
        <div><label className="admin-label">Right Side Image URL</label><input {...I('section1.image', 'https://...')} />
          {get('section1.image') && <img src={get('section1.image')} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />}
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section title="Mission & Vision (shown in 2-column boxes)">
        <div><label className="admin-label">Our Mission</label><textarea className="admin-input resize-none" rows={3} value={get('mission')} onChange={e => set('mission', e.target.value)} placeholder="To deliver reliable, safe, and innovative lifting solutions..." /></div>
        <div><label className="admin-label">Our Vision</label><textarea className="admin-input resize-none" rows={3} value={get('vision')} onChange={e => set('vision', e.target.value)} placeholder="To become one of India's most trusted..." /></div>
      </Section>

      {/* Who We Are Cards */}
      <Section title="Who We Are Cards (3 image cards)">
        <p className="text-slate-500 text-xs">These 3 cards appear on the homepage Who We Are section. Each has an image, title, description.</p>
        {(data?.whoWeAreCards || [{ title: '', description: '', image: '', link: '/' }, { title: '', description: '', image: '', link: '/' }, { title: '', description: '', image: '', link: '/' }]).map((card, i) => (
          <div key={i} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase">Card {i + 1}</p>
            <div><label className="admin-label">Title</label><input className="admin-input" value={card.title || ''} onChange={e => { const cards = [...(data?.whoWeAreCards || [{}, {}, {}])]; cards[i] = { ...cards[i], title: e.target.value }; set('whoWeAreCards', cards); }} /></div>
            <div><label className="admin-label">Description</label><textarea className="admin-input resize-none" rows={3} value={card.description || ''} onChange={e => { const cards = [...(data?.whoWeAreCards || [{}, {}, {}])]; cards[i] = { ...cards[i], description: e.target.value }; set('whoWeAreCards', cards); }} /></div>
            <div><label className="admin-label">Image URL</label><input className="admin-input" value={card.image || ''} onChange={e => { const cards = [...(data?.whoWeAreCards || [{}, {}, {}])]; cards[i] = { ...cards[i], image: e.target.value }; set('whoWeAreCards', cards); }} placeholder="https://..." />
              {card.image && <img src={card.image} alt="Preview" className="mt-2 h-20 object-cover rounded" onError={e => e.target.style.display = 'none'} />}
            </div>
            <div><label className="admin-label">Link</label><input className="admin-input" value={card.link || '/'} onChange={e => { const cards = [...(data?.whoWeAreCards || [{}, {}, {}])]; cards[i] = { ...cards[i], link: e.target.value }; set('whoWeAreCards', cards); }} /></div>
          </div>
        ))}
      </Section>

      {/* Stats */}
      <Section title="Stats (200+, 500+ etc.)">
        {(data?.stats || [{ value: '200+', label: 'Cranes Deployed' }, { value: '500+', label: 'Projects Completed' }, { value: '15+', label: 'Years Experience' }, { value: '50+', label: 'Cities Served' }]).map((stat, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input className="admin-input w-24" value={stat.value || ''} onChange={e => { const stats = [...(data?.stats || [])]; stats[i] = { ...stats[i], value: e.target.value }; set('stats', stats); }} placeholder="200+" />
            <input className="admin-input flex-1" value={stat.label || ''} onChange={e => { const stats = [...(data?.stats || [])]; stats[i] = { ...stats[i], label: e.target.value }; set('stats', stats); }} placeholder="Cranes Deployed" />
            <button onClick={() => { const stats = (data?.stats || []).filter((_, idx) => idx !== i); set('stats', stats); }} className="btn-danger p-2"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => { const stats = [...(data?.stats || []), { value: '', label: '' }]; set('stats', stats); }} className="btn-secondary text-xs"><Plus className="w-3.5 h-3.5" /> Add Stat</button>
      </Section>

      {/* CTA */}
      <Section title="CTA Section (bottom buttons)">
        <div><label className="admin-label">Title</label><input {...I('cta.title', 'Ready to Work With Us?')} /></div>
        <div><label className="admin-label">Subtitle</label><input {...I('cta.subtitle')} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Button 1 Text</label><input {...I('cta.btn1Text', 'Request a Quote')} /></div>
          <div><label className="admin-label">Button 1 Link</label><input {...I('cta.btn1Link', '/contact')} /></div>
          <div><label className="admin-label">Button 2 Text</label><input {...I('cta.btn2Text', 'View Our Fleet')} /></div>
          <div><label className="admin-label">Button 2 Link</label><input {...I('cta.btn2Link', '/our-cranes')} /></div>
        </div>
      </Section>

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save All Changes</>}
        </button>
      </div>
    </div>
  );
}


