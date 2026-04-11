import { useState, useEffect } from 'react';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  useEffect(() => { fetch('/api/subscribers').then(r => r.json()).then(setSubscribers); }, []);

  const active = subscribers.filter(s => s.is_active);
  const inactive = subscribers.filter(s => !s.is_active);

  return (
    <div>
      <div className="page-header">
        <h1>Subscribers</h1>
        <p>All bot subscribers ({active.length} active, {inactive.length} inactive)</p>
      </div>

      {subscribers.length === 0 ? (
        <div className="card empty-state">No subscribers yet.</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>User</th>
                <th style={{ padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Username</th>
                <th style={{ padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Chat ID</th>
                <th style={{ padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>{s.first_name} {s.last_name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{s.username ? `@${s.username}` : '—'}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>{s.chat_id}</td>
                  <td style={{ padding: '10px 12px' }}><span className="badge badge-blue">{s.chat_type}</span></td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>
                    {new Date(s.subscribed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
