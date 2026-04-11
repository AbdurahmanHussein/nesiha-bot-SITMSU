const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'nesiha.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      is_active INTEGER DEFAULT 1,
      chat_type TEXT DEFAULT 'private',
      subscribed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_ar TEXT,
      description TEXT,
      speaker TEXT,
      location TEXT,
      date TEXT NOT NULL,
      time TEXT,
      category TEXT DEFAULT 'dawah',
      status TEXT DEFAULT 'upcoming',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER,
      message TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      is_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      username TEXT,
      first_name TEXT,
      category TEXT DEFAULT 'general',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_response TEXT,
      responded_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_ar TEXT,
      content TEXT,
      category TEXT DEFAULT 'dawah',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 1,
      allows_multiple INTEGER DEFAULT 0,
      telegram_poll_ids TEXT,
      sent_to_groups TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT UNIQUE NOT NULL,
      title TEXT,
      joined_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_photo TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS command_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      command TEXT NOT NULL,
      executed_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Insert default settings if not present
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  insertSetting.run('bot_token', '');
  insertSetting.run('welcome_message',
    '🌿 *Welcome to Nesiha Bot!*\n\nAssalamu Alaikum! You have been subscribed to the Da\'wah & Irshad bot.\n\nUse /help to see available commands.'
  );

  // Initialize default admin if no admins exist
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
  if (adminCount === 0) {
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('nesihaAdmin#26', salt);
    db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)').run('abdurahman.h.beriso@gmail.com', hash);
  }
}

module.exports = { getDb };
