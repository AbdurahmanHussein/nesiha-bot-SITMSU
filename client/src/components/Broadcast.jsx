import { useState } from 'react';

const TEMPLATES = {
  'Juma Sunnahs': `🕌 *Jumu'ah Mubarak!*\n\nDon't forget the Sunnahs of Friday:\n1. Ghusl (Purification)\n2. Wearing clean clothes & perfume (for brothers)\n3. Reciting Surah Al-Kahf\n4. Sending abundant salawat upon the Prophet ﷺ\n5. Making du'a in the last hour before Maghrib\n\n_May Allah accept from us all._`,
  'Hijri Month Start': `🌙 *New Hijri Month*\n\nAssalamu Alaikum,\n\nWe welcome the new Hijri month. "O Allah, bring it over us with blessing and faith, and safety and Islam." (Tirmidhi)\n\n_Stay tuned for our upcoming programs this month!_`,
  'Daily Hadith': `📖 *Hadith of the Day*\n\nThe Prophet ﷺ said:\n"[Insert text here]"\n\n_(Sahih Bukhari)_`,
  'Program Reminder': `📢 *Program Reminder*\n\nDear brothers and sisters,\n\nReminder: Our Da'wah program will be starting soon.\n\nPlease prepare and join us inshaAllah!\n\n_JazakAllahu Khairan_`,
  'General Announcement': `📢 *Announcement*\n\nAssalamu Alaikum wa Rahmatullahi wa Barakatuhu,\n\n[Your announcement here]\n\n_Da'wah & Irshad Sector_`,
};

export default function Broadcast() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!confirm('Send this message to ALL active subscribers?')) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResult(data);
      if (data.sent) setMessage('');
    } catch {
      setResult({ error: 'Failed to send broadcast' });
    }
    setSending(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Broadcast Message</h1>
        <p>Send a message to all active subscribers</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Quick Templates:</label>
          <div className="chip-group">
            {Object.keys(TEMPLATES).map(name => (
              <button key={name} className="chip" onClick={() => setMessage(TEMPLATES[name])}>{name}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Message (Markdown supported)</label>
          <textarea
            className="form-textarea"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
            placeholder="Write your broadcast message here..."
          />
        </div>

        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Messages are sent using Telegram Markdown formatting</p>

        {result && (
          <div className={`info-box ${result.error ? '' : 'info-box-green'}`} style={result.error ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } : {}}>
            {result.error
              ? `❌ ${result.error}`
              : `✅ Broadcast sent to ${result.sent} subscriber(s). ${result.failed} failed.`}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-gold" onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}
