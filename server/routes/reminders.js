const express = require('express');
const { query, queryOne, execute } = require('../db');
const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
  const reminders = await query(`
    SELECT r.*, p.title as program_title
    FROM reminders r
    LEFT JOIN programs p ON r.program_id = p.id
    ORDER BY r.remind_at ASC
  `);
  res.json(reminders);
});

// Create a reminder
router.post('/', async (req, res) => {
  const { program_id, message, remind_at } = req.body;
  const result = await queryOne(`
    INSERT INTO reminders (program_id, message, remind_at)
    VALUES ($1, $2, $3) RETURNING id
  `, [program_id || null, message, remind_at]);
  res.json({ id: result.id });
});

// Delete a reminder
router.delete('/:id', async (req, res) => {
  await execute("DELETE FROM reminders WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
