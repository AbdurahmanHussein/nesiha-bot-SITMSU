const express = require('express');
const { getDb } = require('../db');
const { announceProgram } = require('../bot');
const router = express.Router();

// Get all programs
router.get('/', (req, res) => {
  const db = getDb();
  const programs = db.prepare("SELECT * FROM programs ORDER BY date DESC").all();
  res.json(programs);
});

// Create a program
router.post('/', (req, res) => {
  const db = getDb();
  const { title, title_ar, description, speaker, location, date, time, category } = req.body;
  const result = db.prepare(`
    INSERT INTO programs (title, title_ar, description, speaker, location, date, time, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, title_ar || '', description || '', speaker || '', location || '', date, time || '', category || 'dawah');
  res.json({ id: result.lastInsertRowid });
});

// Update a program
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, title_ar, description, speaker, location, date, time, category, status } = req.body;
  db.prepare(`
    UPDATE programs SET title=?, title_ar=?, description=?, speaker=?, location=?, date=?, time=?, category=?, status=?
    WHERE id=?
  `).run(title, title_ar || '', description || '', speaker || '', location || '', date, time || '', category || 'dawah', status || 'upcoming', req.params.id);
  res.json({ success: true });
});

// Delete a program
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM programs WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Announce a program to all subscribers
router.post('/:id/announce', async (req, res) => {
  try {
    const result = await announceProgram(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
