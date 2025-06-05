
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

// Get all tags
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tags ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create new tag
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO tags (name, color, description) VALUES (?, ?, ?)',
      [name, color || '#3B82F6', description]
    );
    res.status(201).json({ id: result.insertId, name, color, description });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

module.exports = router;
