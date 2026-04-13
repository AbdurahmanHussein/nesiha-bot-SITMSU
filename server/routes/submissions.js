const express = require('express');
const { query, queryOne, execute } = require('../db');
const { sendNesihaResponse } = require('../bot');
const router = express.Router();

// Get all submissions
router.get('/', async (req, res) => {
  const submissions = await query("SELECT * FROM submissions ORDER BY created_at DESC");
  res.json(submissions);
});

// Respond to a submission (sends reply to user privately)
router.post('/:id/respond', async (req, res) => {
  const { response } = req.body;

  if (!response) return res.status(400).json({ error: 'Response is required' });

  const submission = await queryOne("SELECT * FROM submissions WHERE id = $1", [req.params.id]);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  try {
    // Send response to user privately
    await sendNesihaResponse(submission.chat_id, response);

    // Update submission status
    await execute(`
      UPDATE submissions SET status = 'responded', admin_response = $1, responded_at = NOW()
      WHERE id = $2
    `, [response, req.params.id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a submission
router.delete('/:id', async (req, res) => {
  await execute("DELETE FROM submissions WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
