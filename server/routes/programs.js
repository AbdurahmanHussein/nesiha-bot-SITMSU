const express = require('express');
const { query, queryOne, execute } = require('../db');
const { announceProgram } = require('../bot');
const router = express.Router();

// Get all programs
router.get('/', async (req, res) => {
  const programs = await query("SELECT * FROM programs ORDER BY date DESC");
  res.json(programs);
});

// Create a program
router.post('/', async (req, res) => {
  const { title, title_ar, description, speaker, location, date, time, category } = req.body;
  const result = await queryOne(`
    INSERT INTO programs (title, title_ar, description, speaker, location, date, time, category)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
  `, [title, title_ar || '', description || '', speaker || '', location || '', date, time || '', category || 'dawah']);
  res.json({ id: result.id });
});

// Update a program
router.put('/:id', async (req, res) => {
  const { title, title_ar, description, speaker, location, date, time, category, status } = req.body;
  await execute(`
    UPDATE programs SET title=$1, title_ar=$2, description=$3, speaker=$4, location=$5, date=$6, time=$7, category=$8, status=$9
    WHERE id=$10
  `, [title, title_ar || '', description || '', speaker || '', location || '', date, time || '', category || 'dawah', status || 'upcoming', req.params.id]);
  res.json({ success: true });
});

// Delete a program
router.delete('/:id', async (req, res) => {
  await execute("DELETE FROM programs WHERE id = $1", [req.params.id]);
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
