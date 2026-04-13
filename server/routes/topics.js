const express = require('express');
const { query, queryOne, execute } = require('../db');
const router = express.Router();

// Get all topics
router.get('/', async (req, res) => {
  const topics = await query("SELECT * FROM topics ORDER BY created_at DESC");
  res.json(topics);
});

// Create a topic
router.post('/', async (req, res) => {
  const { title, title_ar, content, category } = req.body;
  const result = await queryOne(`
    INSERT INTO topics (title, title_ar, content, category)
    VALUES ($1, $2, $3, $4) RETURNING id
  `, [title, title_ar || '', content || '', category || 'dawah']);
  res.json({ id: result.id });
});

// Update a topic
router.put('/:id', async (req, res) => {
  const { title, title_ar, content, category } = req.body;
  await execute(`
    UPDATE topics SET title=$1, title_ar=$2, content=$3, category=$4 WHERE id=$5
  `, [title, title_ar || '', content || '', category || 'dawah', req.params.id]);
  res.json({ success: true });
});

// Delete a topic
router.delete('/:id', async (req, res) => {
  await execute("DELETE FROM topics WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
