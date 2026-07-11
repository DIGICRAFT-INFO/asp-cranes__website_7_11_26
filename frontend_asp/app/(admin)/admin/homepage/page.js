'use client';
import { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Globe, Save, Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-card overflow-hidden p-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,116,139,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: '#94a3b8' }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: '1px solid rgba(51,65,85,0.4)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HomepagePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get('/homepage').then(r => setData(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/homepage', data);
      toast.success('Homepage updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const set = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addSlide = () => setData(prev => ({ ...prev, hero: { ...prev.hero, slides: [...(prev.hero?.slides || []), { title: '', subtitle: 'WE PROVIDE CRANE RENTAL SERVICES', description: '', btn1Text: 'About Company', btn1Link: '/about', btn2Text: 'Get a Quote', btn2Link: '/contact', image: '', isActive: true, order: 0 }] } }));
  const removeSlide = (i) => setData(prev => ({ ...prev, hero: { ...prev.hero, slides: prev.hero.slides.filter((_, idx) => idx !== i) } }));
  const setSlide = (i, key, val) => setData(prev => { const slides = [...(prev.hero?.slides || [])]; slides[i] = { ...slides[i], [key]: val }; return { ...prev, hero: { ...prev.hero, slides } }; });

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f87171' }} /></div>;
  if (!data) return <div className="text-center py-24" style={{ color: '#64748b' }}>Failed to load homepage data</div>;

  const I = (path, placeholder = '') => ({
    value: path.split('.').reduce((o, k) => o?.[k], data) || '',
    onChange: e => set(path, e.target.value),
    className: 'admin-input',
    placeholder,
  });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5" style={{ color: '#f87171' }} /> Homepage Editor</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Changes reflect live on the website</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save All Changes</>}
        </button>
      </div>

      <Section title="Hero Slider" defaultOpen>
        {(data.hero?.slides || []).map((slide, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase" style={{ color: '#94a3b8' }}>Slide {i + 1}</span>
              <button onClick={() => removeSlide(i)} className="btn-danger p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="admin-label">Title</label><input className="admin-input" value={slide.title} onChange={e => setSlide(i, 'title', e.target.value)} placeholder="Crane type name" /></div>
              <div><label className="admin-label">Subtitle</label><input className="admin-input" value={slide.subtitle} onChange={e => setSlide(i, 'subtitle', e.target.value)} /></div>
              <div className="col-span-2"><label className="admin-label">Description</label><textarea className="admin-input" style={{ resize: 'none' }} rows={2} value={slide.description} onChange={e => setSlide(i, 'description', e.target.value)} /></div>
              <div><label className="admin-label">Image URL</label><input className="admin-input" value={slide.image} onChange={e => setSlide(i, 'image', e.target.value)} placeholder="https://..." /></div>
              <div><label className="admin-label">Button 1 Text</label><input className="admin-input" value={slide.btn1Text} onChange={e => setSlide(i, 'btn1Text', e.target.value)} /></div>
              <div><label className="admin-label">Button 1 Link</label><input className="admin-input" value={slide.btn1Link} onChange={e => setSlide(i, 'btn1Link', e.target.value)} /></div>
              <div><label className="admin-label">Button 2 Text</label><input className="admin-input" value={slide.btn2Text} onChange={e => setSlide(i, 'btn2Text', e.target.value)} /></div>
              <div><label className="admin-label">Button 2 Link</label><input className="admin-input" value={slide.btn2Link} onChange={e => setSlide(i, 'btn2Link', e.target.value)} /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!slide.isActive} onChange={e => setSlide(i, 'isActive', e.target.checked)} />
              <span className="text-sm" style={{ color: '#cbd5e1' }}>Active</span>
            </label>
          </div>
        ))}
        <button onClick={addSlide} className="btn-secondary w-full justify-center"><Plus className="w-4 h-4" /> Add Slide</button>
      </Section>

      <Section title="About Section">
        <div><label className="admin-label">Tagline</label><input {...I('about.tagline', 'ABOUT US')} /></div>
        <div><label className="admin-label">Title</label><input {...I('about.title')} /></div>
        <div>
          <label className="admin-label">Paragraphs (one per line)</label>
          <textarea className="admin-input" style={{ resize: 'none' }} rows={5}
            value={(data.about?.paragraphs || []).join('\n')}
            onChange={e => set('about.paragraphs', e.target.value.split('\n'))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Button Text</label><input {...I('about.btnText')} /></div>
          <div><label className="admin-label">Button Link</label><input {...I('about.btnLink')} /></div>
        </div>
      </Section>

      <Section title="Services Section Header">
        <div><label className="admin-label">Tagline</label><input {...I('services.tagline', 'OUR SERVICES')} /></div>
        <div><label className="admin-label">Title</label><input {...I('services.title')} /></div>
      </Section>

      <Section title="Advantages Section">
        <div><label className="admin-label">Title</label><input {...I('advantages.title')} /></div>
        <div><label className="admin-label">Subtitle</label><input {...I('advantages.subtitle')} /></div>
        <div><label className="admin-label">Customer Points (one per line)</label>
          <textarea className="admin-input" style={{ resize: 'none' }} rows={4}
            value={(data.advantages?.customerPoints || []).join('\n')}
            onChange={e => set('advantages.customerPoints', e.target.value.split('\n').filter(Boolean))} />
        </div>
        <div><label className="admin-label">Rental Company Points (one per line)</label>
          <textarea className="admin-input" style={{ resize: 'none' }} rows={4}
            value={(data.advantages?.rentalPoints || []).join('\n')}
            onChange={e => set('advantages.rentalPoints', e.target.value.split('\n').filter(Boolean))} />
        </div>
        <div><label className="admin-label">Button Text</label><input {...I('advantages.btnText')} /></div>
        <div><label className="admin-label">Button Link</label><input {...I('advantages.btnLink', '/contact')} /></div>
      </Section>

      <Section title="Blog Section Header">
        <div><label className="admin-label">Title</label><input {...I('blog.title', 'Industry Insights')} /></div>
        <div><label className="admin-label">Subtitle</label><input {...I('blog.subtitle')} /></div>
      </Section>

      <Section title="FAQ Section Header">
        <div><label className="admin-label">Tagline</label><input {...I('faq.tagline', 'GOT QUESTIONS?')} /></div>
        <div><label className="admin-label">Title</label><input {...I('faq.title')} /></div>
      </Section>

      <Section title="CTA Banner">
        <div><label className="admin-label">Title</label><input {...I('cta.title', 'Need to rent a crane?')} /></div>
        <div><label className="admin-label">Subtitle</label><input {...I('cta.subtitle')} /></div>
        <div><label className="admin-label">Button Text</label><input {...I('cta.btnText')} /></div>
        <div><label className="admin-label">Button Link</label><input {...I('cta.btnLink', '/contact')} /></div>
        <div><label className="admin-label">Image URL</label><input {...I('cta.image')} /></div>
      </Section>

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save All Changes</>}
        </button>
      </div>
    </div>
  );
}
