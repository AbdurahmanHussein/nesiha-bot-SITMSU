const express = require('express');
const { getDb } = require('../db');
const { initBot } = require('../bot');
const router = express.Router();

// Get settings
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM settings").all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

// Update settings
router.put('/', (req, res) => {
  const db = getDb();
  const { bot_token, welcome_message } = req.body;

  if (bot_token !== undefined) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('bot_token', ?)").run(bot_token);
    // Restart bot with new token
    if (bot_token) {
      initBot(bot_token);
    }
  }

  if (welcome_message !== undefined) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('welcome_message', ?)").run(welcome_message);
  }

  res.json({ success: true });
});

module.exports = router;
