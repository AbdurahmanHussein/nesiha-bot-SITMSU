const express = require('express');
const { getDb } = require('../db');
const { sendPollToGroups } = require('../bot');
const router = express.Router();

// Get all polls
router.get('/', (req, res) => {
  const db = getDb();
  const polls = db.prepare("SELECT * FROM polls ORDER BY created_at DESC").all();
  res.json(polls.map(p => ({
    ...p,
    options: JSON.parse(p.options || '[]'),
    telegram_poll_ids: p.telegram_poll_ids ? JSON.parse(p.telegram_poll_ids) : [],
    sent_to_groups: p.sent_to_groups ? JSON.parse(p.sent_to_groups) : [],
  })));
});

// Get all groups the bot is in
router.get('/groups', (req, res) => {
  const db = getDb();
  const groups = db.prepare("SELECT * FROM groups ORDER BY joined_at DESC").all();
  res.json(groups);
});

// Create a poll
router.post('/', (req, res) => {
  const db = getDb();
  const { question, options, is_anonymous, allows_multiple } = req.body;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Question and at least 2 options are required' });
  }

  const result = db.prepare(`
    INSERT INTO polls (question, options, is_anonymous, allows_multiple)
    VALUES (?, ?, ?, ?)
  `).run(question, JSON.stringify(options), is_anonymous ? 1 : 0, allows_multiple ? 1 : 0);

  res.json({ id: result.lastInsertRowid });
});

// Send a poll to all groups
router.post('/:id/send', async (req, res) => {
  try {
    const result = await sendPollToGroups(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a poll
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM polls WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
