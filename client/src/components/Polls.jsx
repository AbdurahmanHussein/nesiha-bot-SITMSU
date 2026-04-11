import { useState, useEffect } from 'react';

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', ''], is_anonymous: true, allows_multiple: false });
  const [sendingPoll, setSendingPoll] = useState(null);

  const load = () => {
    fetch('/api/polls').then(r => r.json()).then(setPolls);
    fetch('/api/polls/groups').then(r => r.json()).then(setGroups);
  };
  useEffect(() => { load(); }, []);

  const addOption = () => {
    if (form.options.length >= 10) return;
    setForm({ ...form, options: [...form.options, ''] });
  };

  const removeOption = (idx) => {
    if (form.options.length <= 2) return;
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) });
  };

  const updateOption = (idx, value) => {
    const opts = [...form.options];
    opts[idx] = value;
    setForm({ ...form, options: opts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validOptions = form.options.filter(o => o.trim());
    if (validOptions.length < 2) { alert('At least 2 options required'); return; }

    await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, options: validOptions }),
    });
    setForm({ question: '', options: ['', ''], is_anonymous: true, allows_multiple: false });
    setShowForm(false);
    load();
  };

  const handleSend = async (id) => {
    if (groups.length === 0) {
      alert('No groups found. The bot must be added to at least one group first.');
      return;
    }
    if (!confirm(`Send this poll to ${groups.length} group(s)?`)) return;

    setSendingPoll(id);
    try {
      const res = await fetch(`/api/polls/${id}/send`, { method: 'POST' });
      const data = await res.json();
      alert(`Poll sent to ${data.sent} group(s). ${data.failed} failed.`);
    } catch {
      alert('Failed to send poll');
    }
    setSendingPoll(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this poll?')) return;
    await fetch(`/api/polls/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1>Polls</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>
            Create and send polls to groups ({groups.length} group{groups.length !== 1 ? 's' : ''} tracked)
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Poll'}
        </button>
      </div>

      {groups.length > 0 && (
        <div className="info-box info-box-green" style={{ marginBottom: 20 }}>
          <strong>Groups:</strong> {groups.map(g => g.title).join(', ')}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">Poll Question *</label>
            <input
              required
              className="form-input"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              placeholder="e.g., What time is suitable for the next program?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Options (min 2, max 10)</label>
            {form.options.map((opt, idx) => (
              <div key={idx} className="poll-option-row">
                <input
                  className="form-input"
                  value={opt}
                  onChange={e => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
                {form.options.length > 2 && (
                  <button type="button" className="btn btn-danger btn-xs" onClick={() => removeOption(idx)}>✕</button>
                )}
              </div>
            ))}
            {form.options.length < 10 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={addOption} style={{ marginTop: 4 }}>
                + Add Option
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} />
              Anonymous voting
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.allows_multiple} onChange={e => setForm({ ...form, allows_multiple: e.target.checked })} />
              Allow multiple answers
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Create Poll</button>
          </div>
        </form>
      )}

      <div>
        {polls.length === 0 && <div className="card empty-state">No polls yet. Create one to send to your groups.</div>}
        {polls.map(p => (
          <div key={p.id} className="list-item" style={{ marginBottom: 12 }}>
            <div className="list-item-header">
              <div style={{ flex: 1 }}>
                <div className="list-item-title">📊 {p.question}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {p.options.map((opt, i) => (
                    <span key={i} className="badge badge-blue">{opt}</span>
                  ))}
                </div>
                <div className="list-item-meta" style={{ marginTop: 8 }}>
                  <span>{p.is_anonymous ? '🔒 Anonymous' : '👁 Public'}</span>
                  <span>{p.allows_multiple ? '☑ Multiple' : '○ Single'}</span>
                  {p.sent_to_groups.length > 0 && (
                    <span className="badge badge-green">Sent to {p.sent_to_groups.length} group(s)</span>
                  )}
                  <span style={{ color: '#9ca3af' }}>{new Date(p.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="list-item-actions">
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => handleSend(p.id)}
                  disabled={sendingPoll === p.id}
                >
                  {sendingPoll === p.id ? '...' : '📤 Send to Groups'}
                </button>
                <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
