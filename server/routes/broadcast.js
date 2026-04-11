const express = require('express');
const { broadcastMessage } = require('../bot');
const router = express.Router();

// Send broadcast
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const result = await broadcastMessage(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
