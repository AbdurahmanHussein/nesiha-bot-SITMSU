const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

// Get all subscribers
router.get('/', (req, res) => {
  const db = getDb();
  const subscribers = db.prepare("SELECT * FROM subscribers ORDER BY subscribed_at DESC").all();
  res.json(subscribers);
});

module.exports = router;
