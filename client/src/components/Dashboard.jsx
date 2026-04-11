import { useState, useEffect } from 'react';

const STAT_ITEMS = [
  { key: 'upcomingPrograms', label: 'Upcoming Programs', color: '#22c55e', bg: '#f0fdf4', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'activeSubscribers', label: 'Active Subscribers', color: '#3b82f6', bg: '#eff6ff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'newSubmissions', label: 'New Submissions', color: '#f59e0b', bg: '#fef9c3', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { key: 'totalTopics', label: "Da'wah Topics", color: '#8b5cf6', bg: '#f5f3ff', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { key: 'pendingReminders', label: 'Pending Reminders', color: '#f97316', bg: '#fff7ed', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
];

import CalendarWidget from './CalendarWidget';

// ... (keep inside the file)
export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => setStats({}));
  }, []);

  if (!stats) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Nesiha Bot — Da'wah & Irshad Management</p>
      </div>

      <div className={`bot-status ${stats.botConnected ? 'bot-status-connected' : 'bot-status-disconnected'}`}>
        <div className="bot-status-dot" />
        {stats.botConnected
          ? 'Bot is connected and running'
          : 'Bot is not connected — Set your token in Settings'}
      </div>

      <div className="stats-grid">
        {STAT_ITEMS.map(item => (
          <div className="stat-card" key={item.key}>
            <div className="stat-icon" style={{ background: item.bg }}>
              <svg width="20" height="20" fill="none" stroke={item.color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <div className="stat-value">{stats[item.key] ?? 0}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <CalendarWidget />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>About Nesiha Bot</h3>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
            Nesiha is a Telegram bot for the Da'wah & Irshad Sector that helps:
          </p>
          <ul style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, paddingLeft: 20, marginTop: 8 }}>
            <li>Announce new Da'wah programs (every 3 weeks)</li>
            <li>Send reminders before programs</li>
            <li>Receive anonymous advice requests (Nesiha)</li>
            <li>Share Da'wah topics and resources</li>
            <li>Broadcast messages to all subscribers</li>
            <li>Send polls to groups for voting</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Bot Commands</h3>
          <div style={{ fontSize: 14, fontFamily: 'monospace' }}>
            {[
              ['/start', 'Subscribe to bot'],
              ['/programs', 'View upcoming programs'],
              ['/topics', "Browse Da'wah topics"],
              ['/nesiha', 'Submit anonymous request'],
              ['/help', 'Show all commands'],
              ['/unsubscribe', 'Unsubscribe'],
            ].map(([cmd, desc]) => (
              <div key={cmd} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#16a34a', fontWeight: 500 }}>{cmd}</span>
                <span style={{ color: '#9ca3af' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
