const express = require('express');
const { getDb } = require('../db');
const { sendNesihaResponse } = require('../bot');
const router = express.Router();

// Get all submissions
router.get('/', (req, res) => {
  const db = getDb();
  const submissions = db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all();
  res.json(submissions);
});

// Respond to a submission (sends reply to user privately)
router.post('/:id/respond', async (req, res) => {
  const db = getDb();
  const { response } = req.body;

  if (!response) return res.status(400).json({ error: 'Response is required' });

  const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  try {
    // Send response to user privately
    await sendNesihaResponse(submission.chat_id, response);

    // Update submission status
    db.prepare(`
      UPDATE submissions SET status = 'responded', admin_response = ?, responded_at = datetime('now')
      WHERE id = ?
    `).run(response, req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a submission
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM submissions WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
