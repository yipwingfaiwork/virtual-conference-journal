
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

// Get all financial periods
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM financial_periods ORDER BY startDate DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching financial periods:', error);
    res.status(500).json({ error: 'Failed to fetch financial periods' });
  }
});

// Create new financial period
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO financial_periods (name, startDate, endDate, isActive) VALUES (?, ?, ?, ?)',
      [name, startDate, endDate, isActive || true]
    );
    res.status(201).json({ id: result.insertId, name, startDate, endDate, isActive });
  } catch (error) {
    console.error('Error creating financial period:', error);
    res.status(500).json({ error: 'Failed to create financial period' });
  }
});

module.exports = router;
