const express = require('express');
const { queryOne } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const upcomingPrograms = await queryOne("SELECT COUNT(*) as count FROM programs WHERE status = 'upcoming'");
  const activeSubscribers = await queryOne("SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1");
  const newSubmissions = await queryOne("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'");
  const totalTopics = await queryOne("SELECT COUNT(*) as count FROM topics");
  const pendingReminders = await queryOne("SELECT COUNT(*) as count FROM reminders WHERE is_sent = 0");

  const token = await queryOne("SELECT value FROM settings WHERE key = 'bot_token'");
  const botConnected = !!(token?.value && token.value.length > 10);

  res.json({
    upcomingPrograms: parseInt(upcomingPrograms.count),
    activeSubscribers: parseInt(activeSubscribers.count),
    newSubmissions: parseInt(newSubmissions.count),
    totalTopics: parseInt(totalTopics.count),
    pendingReminders: parseInt(pendingReminders.count),
    botConnected,
  });
});

module.exports = router;
