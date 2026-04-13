require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, queryOne, execute } = require('./db');
const { initBot } = require('./bot');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Public API Routes
app.use('/api/auth', require('./routes/auth'));

// Protected API Routes
app.use('/api/stats', requireAuth, require('./routes/stats'));
app.use('/api/analytics', requireAuth, require('./routes/analytics'));
app.use('/api/programs', requireAuth, require('./routes/programs'));
app.use('/api/reminders', requireAuth, require('./routes/reminders'));
app.use('/api/broadcast', requireAuth, require('./routes/broadcast'));
app.use('/api/subscribers', requireAuth, require('./routes/subscribers'));
app.use('/api/submissions', requireAuth, require('./routes/submissions'));
app.use('/api/topics', requireAuth, require('./routes/topics'));
app.use('/api/settings', requireAuth, require('./routes/settings'));
app.use('/api/polls', requireAuth, require('./routes/polls'));

// Serve React frontend in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

// Async startup
async function start() {
  // Initialize database schema
  await initDb();

  // Start bot if token exists
  const tokenRow = await queryOne("SELECT value FROM settings WHERE key = 'bot_token'");
  const envToken = process.env.BOT_TOKEN;
  const token = envToken || tokenRow?.value;

  if (token && token.length > 10) {
    if (envToken && envToken !== tokenRow?.value) {
      await execute(
        "INSERT INTO settings (key, value) VALUES ('bot_token', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
        [envToken]
      );
    }
    initBot(token);
  } else {
    console.log('⚠️  No bot token found. Set BOT_TOKEN in .env or via the admin dashboard Settings.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Nesiha Bot Admin Server running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
