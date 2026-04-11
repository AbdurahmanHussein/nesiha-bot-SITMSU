const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  
  // 1. Daily Active Users (calculated from command logs in the last 7 days)
  const dauData = db.prepare(`
    SELECT date(executed_at) as date, COUNT(DISTINCT chat_id) as count 
    FROM command_logs 
    WHERE executed_at >= datetime('now', '-7 days')
    GROUP BY date(executed_at)
    ORDER BY date(executed_at) ASC
  `).all();

  // 2. Popular Commands
  const popularCommands = db.prepare(`
    SELECT command, COUNT(*) as count 
    FROM command_logs 
    GROUP BY command 
    ORDER BY count DESC 
    LIMIT 5
  `).all();

  // 3. Submissions by Category
  const submissionsByCategory = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM submissions 
    GROUP BY category
    ORDER BY count DESC
  `).all();

  // Fill in missing days for DAU chart if needed (simple approach for UI)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = dauData.find(row => row.date === dateStr);
    chartData.push({
      date: dateStr.split('-').slice(1).join('/'), // e.g., 04/09
      count: found ? found.count : 0
    });
  }

  res.json({
    dauData: chartData,
    popularCommands,
    submissionsByCategory
  });
});

module.exports = router;
