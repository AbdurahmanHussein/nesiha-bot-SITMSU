const express = require('express');
const { query } = require('../db');
const router = express.Router();

// Get all subscribers
router.get('/', async (req, res) => {
  const subscribers = await query("SELECT * FROM subscribers ORDER BY subscribed_at DESC");
  res.json(subscribers);
});

module.exports = router;
