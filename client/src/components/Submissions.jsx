import { useState, useEffect } from 'react';

const CATEGORY_LABELS = {
  general: '📋 General',
  education: '📚 Education',
  time_management: '⏰ Time Management',
  ibadah: '🕌 Ibadah',
  zikr: '📿 Zikr & Dua',
  family: '👨‍👩‍👧 Family',
  other: '💬 Other',
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => fetch('/api/submissions').then(r => r.json()).then(setSubmissions);
  useEffect(() => { load(); }, []);

  const handleRespond = async (id) => {
    if (!responseText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/submissions/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText }),
      });
      const data = await res.json();
      if (data.success) {
        setRespondingTo(null);
        setResponseText('');
        load();
      } else {
        alert(data.error || 'Failed to send response');
      }
    } catch {
      alert('Failed to send response');
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this submission?')) return;
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
    load();
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const responded = submissions.filter(s => s.status === 'responded');

  return (
    <div>
      <div className="page-header">
        <h1>Nesiha Submissions</h1>
        <p>Advice requests from users ({pending.length} pending, {responded.length} responded)</p>
      </div>

      {submissions.length === 0 ? (
        <div className="card empty-state">No submissions yet. Users can submit advice requests using /nesiha in the bot.</div>
      ) : (
        <div>
          {pending.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#d97706' }}>
                📋 Pending ({pending.length})
              </h3>
              {pending.map(s => (
                <SubmissionCard
                  key={s.id} s={s}
                  respondingTo={respondingTo} setRespondingTo={setRespondingTo}
                  responseText={responseText} setResponseText={setResponseText}
                  handleRespond={handleRespond} handleDelete={handleDelete}
                  sending={sending}
                />
              ))}
            </>
          )}

          {responded.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24, color: '#16a34a' }}>
                ✅ Responded ({responded.length})
              </h3>
              {responded.map(s => (
                <SubmissionCard
                  key={s.id} s={s}
                  respondingTo={respondingTo} setRespondingTo={setRespondingTo}
                  responseText={responseText} setResponseText={setResponseText}
                  handleRespond={handleRespond} handleDelete={handleDelete}
                  sending={sending}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ s, respondingTo, setRespondingTo, responseText, setResponseText, handleRespond, handleDelete, sending }) {
  return (
    <div className="list-item" style={{ marginBottom: 12 }}>
      <div className="list-item-header">
        <div style={{ flex: 1 }}>
          <div className="list-item-meta" style={{ marginTop: 0, marginBottom: 6 }}>
            <span className={`badge ${s.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>
              {s.status === 'pending' ? '⏳ Pending' : '✅ Responded'}
            </span>
            <span className="badge badge-blue">{CATEGORY_LABELS[s.category] || s.category}</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              {s.first_name}{s.username ? ` (@${s.username})` : ''} — {new Date(s.created_at).toLocaleString()}
            </span>
          </div>

          <div style={{ background: '#f9fafb', padding: '12px 16px', borderRadius: 10, fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 4 }}>
            {s.message}
          </div>

          {s.admin_response && (
            <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 10, fontSize: 13, color: '#166534', marginTop: 8, borderLeft: '3px solid #22c55e' }}>
              <strong>Admin Response:</strong> {s.admin_response}
              {s.responded_at && (
                <span style={{ fontSize: 11, color: '#86efac', marginLeft: 8 }}>
                  ({new Date(s.responded_at).toLocaleString()})
                </span>
              )}
            </div>
          )}

          {respondingTo === s.id && (
            <div className="respond-form">
              <textarea
                placeholder="Type your response... This will be sent directly to the user."
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
              />
              <div className="respond-actions">
                <button className="btn btn-outline btn-sm" onClick={() => { setRespondingTo(null); setResponseText(''); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => handleRespond(s.id)} disabled={sending || !responseText.trim()}>
                  {sending ? 'Sending...' : '📨 Send Response'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="list-item-actions">
          {s.status === 'pending' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setRespondingTo(s.id); setResponseText(''); }}>
              💬 Respond
            </button>
          )}
          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(s.id)}>✕</button>
        </div>
      </div>
    </div>
  );
}
