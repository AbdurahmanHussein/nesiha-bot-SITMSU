const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper: run a query and return all rows
async function query(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}

// Helper: run a query and return the first row (or null)
async function queryOne(text, params) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}

// Helper: run an INSERT/UPDATE/DELETE and return result info
async function execute(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// Initialize the database schema
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      chat_id TEXT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      is_active INTEGER DEFAULT 1,
      chat_type TEXT DEFAULT 'private',
      subscribed_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS programs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      title_ar TEXT,
      description TEXT,
      speaker TEXT,
      location TEXT,
      date TEXT NOT NULL,
      time TEXT,
      category TEXT DEFAULT 'dawah',
      status TEXT DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      is_sent INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      chat_id TEXT NOT NULL,
      username TEXT,
      first_name TEXT,
      category TEXT DEFAULT 'general',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_response TEXT,
      responded_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS topics (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      title_ar TEXT,
      content TEXT,
      category TEXT DEFAULT 'dawah',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS polls (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 1,
      allows_multiple INTEGER DEFAULT 0,
      telegram_poll_ids TEXT,
      sent_to_groups TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY,
      chat_id TEXT UNIQUE NOT NULL,
      title TEXT,
      joined_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_photo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS command_logs (
      id SERIAL PRIMARY KEY,
      chat_id TEXT NOT NULL,
      command TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Insert default settings if not present
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('bot_token', '')
     ON CONFLICT (key) DO NOTHING`
  );
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('welcome_message', $1)
     ON CONFLICT (key) DO NOTHING`,
    ['🌿 *Welcome to Nesiha Bot!*\n\nAssalamu Alaikum! You have been subscribed to the Da\'wah & Irshad bot.\n\nUse /help to see available commands.']
  );

  // Initialize default admin if no admins exist
  const adminCheck = await pool.query('SELECT COUNT(*) as count FROM admin_users');
  if (parseInt(adminCheck.rows[0].count) === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('nesihaAdmin#26', salt);
    await pool.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
      ['abdurahman.h.beriso@gmail.com', hash]
    );
    console.log('✅ Default admin user created.');
  }

  console.log('✅ Database schema initialized.');
}

module.exports = { query, queryOne, execute, initDb, pool };
