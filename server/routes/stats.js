const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();

  const upcomingPrograms = db.prepare("SELECT COUNT(*) as count FROM programs WHERE status = 'upcoming'").get().count;
  const activeSubscribers = db.prepare("SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1").get().count;
  const newSubmissions = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'").get().count;
  const totalTopics = db.prepare("SELECT COUNT(*) as count FROM topics").get().count;
  const pendingReminders = db.prepare("SELECT COUNT(*) as count FROM reminders WHERE is_sent = 0").get().count;

  const token = db.prepare("SELECT value FROM settings WHERE key = 'bot_token'").get();
  const botConnected = !!(token?.value && token.value.length > 10);

  res.json({
    upcomingPrograms,
    activeSubscribers,
    newSubmissions,
    totalTopics,
    pendingReminders,
    botConnected,
  });
});

module.exports = router;
