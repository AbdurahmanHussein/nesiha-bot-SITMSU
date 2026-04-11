import { useState, useEffect } from 'react';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', title_ar: '', description: '', speaker: '', location: '', date: '', time: '', category: 'dawah' });
  const [announcing, setAnnouncing] = useState(null);

  const load = () => fetch('/api/programs').then(r => r.json()).then(setPrograms);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ title: '', title_ar: '', description: '', speaker: '', location: '', date: '', time: '', category: 'dawah' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this program?')) return;
    await fetch(`/api/programs/${id}`, { method: 'DELETE' });
    load();
  };

  const handleAnnounce = async (id) => {
    setAnnouncing(id);
    const res = await fetch(`/api/programs/${id}/announce`, { method: 'POST' });
    const data = await res.json();
    alert(`Announcement sent to ${data.sent} subscriber(s). ${data.failed} failed.`);
    setAnnouncing(null);
  };

  const toggleStatus = async (prog) => {
    const newStatus = prog.status === 'upcoming' ? 'completed' : 'upcoming';
    await fetch(`/api/programs/${prog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prog, status: newStatus }),
    });
    load();
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1>Da'wah Programs</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Manage and announce programs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="toggle-program-form">
          {showForm ? 'Cancel' : '+ New Program'}
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
              <label className="form-label">Speaker</label>
              <input className="form-input" value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input required type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="dawah">Da'wah</option>
                <option value="irshad">Irshad</option>
                <option value="education">Education</option>
                <option value="outreach">Outreach</option>
              </select>
            </div>
            <div className="form-group form-grid-full">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Create Program</button>
          </div>
        </form>
      )}

      <div>
        {programs.length === 0 && <div className="card empty-state">No programs yet. Create your first Da'wah program above.</div>}
        {programs.map(p => (
          <div key={p.id} className="list-item">
            <div className="list-item-header">
              <div style={{ flex: 1 }}>
                <div className="list-item-title">
                  {p.title} {p.title_ar && <span style={{ color: '#9ca3af' }}>— {p.title_ar}</span>}
                </div>
                <div className="list-item-meta">
                  {p.date && <span>📆 {p.date}</span>}
                  {p.time && <span>🕐 {p.time}</span>}
                  {p.speaker && <span>🎤 {p.speaker}</span>}
                  {p.location && <span>📍 {p.location}</span>}
                  <span className={`badge ${p.status === 'upcoming' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                  <span className="badge badge-blue">{p.category}</span>
                </div>
                {p.description && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{p.description}</p>}
              </div>
              <div className="list-item-actions">
                <button className="btn btn-gold btn-sm" onClick={() => handleAnnounce(p.id)} disabled={announcing === p.id}>
                  {announcing === p.id ? '...' : '📢 Announce'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(p)}>
                  {p.status === 'upcoming' ? '✓ Complete' : '↩ Reopen'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
