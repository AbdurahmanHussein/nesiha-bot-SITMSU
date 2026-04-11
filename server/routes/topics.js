const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

// Get all topics
router.get('/', (req, res) => {
  const db = getDb();
  const topics = db.prepare("SELECT * FROM topics ORDER BY created_at DESC").all();
  res.json(topics);
});

// Create a topic
router.post('/', (req, res) => {
  const db = getDb();
  const { title, title_ar, content, category } = req.body;
  const result = db.prepare(`
    INSERT INTO topics (title, title_ar, content, category)
    VALUES (?, ?, ?, ?)
  `).run(title, title_ar || '', content || '', category || 'dawah');
  res.json({ id: result.lastInsertRowid });
});

// Update a topic
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, title_ar, content, category } = req.body;
  db.prepare(`
    UPDATE topics SET title=?, title_ar=?, content=?, category=? WHERE id=?
  `).run(title, title_ar || '', content || '', category || 'dawah', req.params.id);
  res.json({ success: true });
});

// Delete a topic
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM topics WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
