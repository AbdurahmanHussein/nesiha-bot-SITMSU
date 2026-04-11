import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Programs from './components/Programs';
import Reminders from './components/Reminders';
import Broadcast from './components/Broadcast';
import Subscribers from './components/Subscribers';
import Submissions from './components/Submissions';
import Topics from './components/Topics';
import Settings from './components/Settings';
import Polls from './components/Polls';
import Login from './components/Login';
import Analytics from './components/Analytics';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('nesiha_token'));
  const [email, setEmail] = useState(localStorage.getItem('nesiha_email'));

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Basic wrapper for fetch to auto-inject token
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const currentToken = localStorage.getItem('nesiha_token');
      if (currentToken && url.startsWith('/api')) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${currentToken}` };
      }
      const res = await originalFetch(url, options);
      if (res.status === 401 && !url.includes('/api/auth/login')) {
        handleLogout();
      }
      return res;
    };

    if (token) {
      window.fetch('/api/auth/verify')
        .then(r => r.json())
        .then(data => {
          if (data.valid) setUser(data.user);
        })
        .catch(console.error);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('nesiha_token');
    localStorage.removeItem('nesiha_email');
    setToken(null);
    setEmail(null);
    setUser(null);
  };

  if (!token) {
    return <Login setToken={setToken} setEmail={setEmail} />;
  }

  const pages = {
    dashboard: <Dashboard />,
    analytics: <Analytics token={token} />,
    programs: <Programs />,
    reminders: <Reminders />,
    broadcast: <Broadcast />,
    subscribers: <Subscribers />,
    submissions: <Submissions />,
    topics: <Topics />,
    settings: <Settings user={user} refreshUser={() => {
      fetch('/api/auth/verify').then(r => r.json()).then(data => { if(data.valid) setUser(data.user) });
    }} />,
    polls: <Polls />,
  };

  const [darkMode, setDarkMode] = useState(localStorage.getItem('nesiha_theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('nesiha_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('nesiha_theme', 'light');
    }
  }, [darkMode]);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="mobile-menu-toggle"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar page={page} setPage={(p) => { setPage(p); setSidebarOpen(false); }} open={sidebarOpen} setOpen={setSidebarOpen} handleLogout={handleLogout} user={user} />

      <main className="main-content">
        {pages[page] || <Dashboard />}
      </main>

      <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark/Light Mode">
        {darkMode ? (
          // Moon icon for dark mode state (clicking it turns to light mode)
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
          </svg>
        ) : (
          // Sun icon for light mode state
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        )}
      </button>
    </>
  );
}
