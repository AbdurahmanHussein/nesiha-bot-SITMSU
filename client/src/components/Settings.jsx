import { useState, useEffect, useRef } from 'react';

export default function Settings({ user, refreshUser }) {
  const [settings, setSettings] = useState({ bot_token: '', welcome_message: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [adminStatus, setAdminStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size limit (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be less than 2MB');
      return;
    }

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const photoBase64 = reader.result;
      try {
        const res = await fetch('/api/auth/profile-photo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoBase64 })
        });
        
        if (res.ok) {
          if (refreshUser) refreshUser(); // Update Sidebar
          alert('Profile photo updated successfully!');
        } else {
          alert('Failed to upload photo.');
        }
      } catch (err) {
        alert('An error occurred during upload.');
      }
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setAdminStatus({ type: 'info', msg: 'Creating admin...' });
    try {
      const res = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      const data = await res.json();
      if (res.ok) {
        setAdminStatus({ type: 'success', msg: 'Admin created successfully!' });
        setNewAdmin({ email: '', password: '' });
        setTimeout(() => setAdminStatus(null), 3000);
      } else {
        setAdminStatus({ type: 'error', msg: data.error || 'Failed to create admin' });
      }
    } catch {
      setAdminStatus({ type: 'error', msg: 'Network error occurred' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure Nesiha Bot & Admin Profile</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Admin Profile</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {user?.profile_photo ? (
            <img src={user.profile_photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', border: '2px solid var(--gray-200)' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--primary-600)', fontWeight: 'bold' }}>
              ن
            </div>
          )}
          
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: 16, marginBottom: 4 }}>{user?.email || 'Admin User'}</div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>Update your dashboard profile photo (Max 2MB)</p>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} id="photo-upload" />
            <div style={{ display: 'flex', gap: 12 }}>
              <label htmlFor="photo-upload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 4 }}>Telegram Bot Token</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          Get your token from <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 500 }}>@BotFather</a> on Telegram
        </p>
        <input
          type="password"
          className="form-input"
          value={settings.bot_token}
          onChange={e => setSettings({ ...settings, bot_token: e.target.value })}
          placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ..."
        />

        <div className="info-box info-box-green" style={{ marginTop: 16 }}>
          <strong>How to get a token:</strong>
          <ol style={{ marginTop: 4, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Open Telegram and search for <strong>@BotFather</strong></li>
            <li>Send /newbot and follow the instructions</li>
            <li>Name your bot <strong>Nesiha</strong></li>
            <li>Copy the token and paste it above</li>
          </ol>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 4 }}>Welcome Message</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Sent when users type /start (supports Markdown)</p>
        <textarea
          className="form-textarea"
          value={settings.welcome_message}
          onChange={e => setSettings({ ...settings, welcome_message: e.target.value })}
          rows={5}
        />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 4 }}>Add New Admin</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Create additional admin accounts for this dashboard</p>
        
        {adminStatus && (
          <div className="info-box" style={{ 
            marginBottom: 16, 
            background: adminStatus.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: adminStatus.type === 'error' ? '#dc2626' : '#16a34a',
            border: `1px solid ${adminStatus.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}>
            {adminStatus.msg}
          </div>
        )}

        <form onSubmit={handleRegisterAdmin} className="form-grid">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} placeholder="new.admin@nesiha.org" />
          </div>
          <div className="form-group">
            <label className="form-label">Password (min 6 chars)</label>
            <input type="password" required minLength="6" className="form-input" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="••••••••" />
          </div>
          <div className="form-group form-grid-full" style={{ display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
            <button type="submit" className="btn btn-primary" disabled={!newAdmin.email || !newAdmin.password || newAdmin.password.length < 6}>
              + Create Admin
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save App Settings'}
        </button>
        {saved && <span style={{ color: '#16a34a', fontSize: 14, fontWeight: 500 }}>✅ Settings saved successfully!</span>}
      </div>
    </div>
  );
}
