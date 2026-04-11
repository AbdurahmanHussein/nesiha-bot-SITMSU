const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

// Get all reminders
router.get('/', (req, res) => {
  const db = getDb();
  const reminders = db.prepare(`
    SELECT r.*, p.title as program_title
    FROM reminders r
    LEFT JOIN programs p ON r.program_id = p.id
    ORDER BY r.remind_at ASC
  `).all();
  res.json(reminders);
});

// Create a reminder
router.post('/', (req, res) => {
  const db = getDb();
  const { program_id, message, remind_at } = req.body;
  const result = db.prepare(`
    INSERT INTO reminders (program_id, message, remind_at)
    VALUES (?, ?, ?)
  `).run(program_id || null, message, remind_at);
  res.json({ id: result.lastInsertRowid });
});

// Delete a reminder
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM reminders WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
