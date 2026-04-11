import { useState, useEffect } from 'react';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ program_id: '', message: '', remind_at: '' });

  const load = () => {
    fetch('/api/reminders').then(r => r.json()).then(setReminders);
    fetch('/api/programs').then(r => r.json()).then(setPrograms);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ program_id: '', message: '', remind_at: '' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1>Reminders</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Schedule reminders for programs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Reminder'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Linked Program</label>
              <select className="form-select" value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}>
                <option value="">None</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Remind At *</label>
              <input required type="datetime-local" className="form-input" value={form.remind_at} onChange={e => setForm({ ...form, remind_at: e.target.value })} />
            </div>
            <div className="form-group form-grid-full">
              <label className="form-label">Message *</label>
              <textarea required className="form-textarea" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Reminder message (supports Markdown)" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Create Reminder</button>
          </div>
        </form>
      )}

      <div>
        {reminders.length === 0 && <div className="card empty-state">No reminders yet.</div>}
        {reminders.map(r => (
          <div key={r.id} className="list-item">
            <div className="list-item-header">
              <div style={{ flex: 1 }}>
                <div className="list-item-title">{r.message.substring(0, 80)}{r.message.length > 80 ? '...' : ''}</div>
                <div className="list-item-meta">
                  <span>⏰ {new Date(r.remind_at).toLocaleString()}</span>
                  {r.program_title && <span>📅 {r.program_title}</span>}
                  <span className={`badge ${r.is_sent ? 'badge-green' : 'badge-yellow'}`}>{r.is_sent ? 'Sent' : 'Pending'}</span>
                </div>
              </div>
              <div className="list-item-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
