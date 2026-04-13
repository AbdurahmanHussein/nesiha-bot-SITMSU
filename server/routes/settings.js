const express = require('express');
const { query, execute } = require('../db');
const { initBot } = require('../bot');
const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  const rows = await query("SELECT * FROM settings");
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

// Update settings
router.put('/', async (req, res) => {
  const { bot_token, welcome_message } = req.body;

  if (bot_token !== undefined) {
    await execute(
      "INSERT INTO settings (key, value) VALUES ('bot_token', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [bot_token]
    );
    // Restart bot with new token
    if (bot_token) {
      initBot(bot_token);
    }
  }

  if (welcome_message !== undefined) {
    await execute(
      "INSERT INTO settings (key, value) VALUES ('welcome_message', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [welcome_message]
    );
  }

  res.json({ success: true });
});

module.exports = router;
