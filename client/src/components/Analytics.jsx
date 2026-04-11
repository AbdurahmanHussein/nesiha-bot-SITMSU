import { useState, useEffect } from 'react';

export default function Analytics({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="empty-state">Loading Analytics...</div>;
  if (!data) return <div className="empty-state">Failed to load analytics data.</div>;

  const maxDau = Math.max(...data.dauData.map(d => d.count), 1);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Bot Performance & Analytics</h1>
        <p>Insights into bot usage and subscriber engagement</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Bot Usage Activity (Last 7 Days)</h3>
        
        {/* Custom Bar Chart for DAU */}
        <div className="chart-container">
          {data.dauData.map((day, idx) => {
            const heightPct = (day.count / maxDau) * 100;
            return (
              <div key={idx} className="chart-bar-group">
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill" 
                    style={{ height: `${heightPct}%`, opacity: heightPct === 0 ? 0 : 1 }}
                  >
                    <span className="chart-tooltip">{day.count} commands</span>
                  </div>
                </div>
                <div className="chart-label">{day.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="form-grid">
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Top Commands</h3>
          {data.popularCommands.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 14 }}>No commands logged yet.</div>
          ) : (
            <div>
              {data.popularCommands.map((cmd, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i !== data.popularCommands.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontWeight: 500, color: '#166534' }}>{cmd.command}</span>
                  <span className="badge badge-gray">{cmd.count} times</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Nesiha Requests by Category</h3>
          {data.submissionsByCategory.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 14 }}>No nesiha requests yet.</div>
          ) : (
            <div>
              {data.submissionsByCategory.map((cat, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i !== data.submissionsByCategory.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ textTransform: 'capitalize', color: '#4b5563' }}>{cat.category.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 600 }}>{cat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
