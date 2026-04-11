import { useState, useEffect } from 'react';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', title_ar: '', content: '', category: 'dawah' });

  const load = () => fetch('/api/topics').then(r => r.json()).then(setTopics);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ title: '', title_ar: '', content: '', category: 'dawah' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this topic?')) return;
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1>Da'wah Topics</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Knowledge base and topic catalog</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Topic'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input required className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Title (Arabic)</label>
              <input dir="rtl" className="form-input rtl-input" value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="dawah">Da'wah</option>
                <option value="aqeedah">Aqeedah</option>
                <option value="fiqh">Fiqh</option>
                <option value="seerah">Seerah</option>
                <option value="hadith">Hadith</option>
                <option value="quran">Quran</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="form-group form-grid-full">
              <label className="form-label">Content</label>
              <textarea className="form-textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} placeholder="Topic content (supports Markdown)" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Create Topic</button>
          </div>
        </form>
      )}

      <div>
        {topics.length === 0 && <div className="card empty-state">No topics yet.</div>}
        {topics.map(t => (
          <div key={t.id} className="list-item">
            <div className="list-item-header">
              <div style={{ flex: 1 }}>
                <div className="list-item-title">
                  {t.title} {t.title_ar && <span style={{ color: '#9ca3af' }}>— {t.title_ar}</span>}
                </div>
                <div className="list-item-meta">
                  <span className="badge badge-blue">{t.category}</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                {t.content && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.6 }}>{t.content.substring(0, 300)}{t.content.length > 300 ? '...' : ''}</p>}
              </div>
              <div className="list-item-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
