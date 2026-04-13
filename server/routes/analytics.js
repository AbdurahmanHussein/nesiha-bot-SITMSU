const express = require('express');
const { query } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  // 1. Daily Active Users (calculated from command logs in the last 7 days)
  const dauData = await query(`
    SELECT DATE(executed_at) as date, COUNT(DISTINCT chat_id) as count 
    FROM command_logs 
    WHERE executed_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(executed_at)
    ORDER BY DATE(executed_at) ASC
  `);

  // 2. Popular Commands
  const popularCommands = await query(`
    SELECT command, COUNT(*) as count 
    FROM command_logs 
    GROUP BY command 
    ORDER BY count DESC 
    LIMIT 5
  `);

  // 3. Submissions by Category
  const submissionsByCategory = await query(`
    SELECT category, COUNT(*) as count 
    FROM submissions 
    GROUP BY category
    ORDER BY count DESC
  `);

  // Fill in missing days for DAU chart if needed (simple approach for UI)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = dauData.find(row => {
      // PG returns Date objects for DATE columns, convert to string
      const rowDate = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
      return rowDate === dateStr;
    });
    chartData.push({
      date: dateStr.split('-').slice(1).join('/'), // e.g., 04/09
      count: found ? parseInt(found.count) : 0
    });
  }

  res.json({
    dauData: chartData,
    popularCommands: popularCommands.map(r => ({ ...r, count: parseInt(r.count) })),
    submissionsByCategory: submissionsByCategory.map(r => ({ ...r, count: parseInt(r.count) }))
  });
});

module.exports = router;
