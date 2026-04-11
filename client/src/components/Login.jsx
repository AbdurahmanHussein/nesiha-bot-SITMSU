import { useState } from 'react';

export default function Login({ setToken, setEmail }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('nesiha_token', data.token);
        localStorage.setItem('nesiha_email', data.email);
        setToken(data.token);
        setEmail(data.email);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred during login');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">ن</div>
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 13, color: '#9ca3af' }}>
            بسم الله الرحمن الرحيم
          </div>
          <h2>Nesiha Admin</h2>
          <p>Da'wah & Irshad Bot Management</p>
        </div>

        {error && <div className="info-box" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="admin@nesiha.org"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
      </div>
    </div>
  );
}
