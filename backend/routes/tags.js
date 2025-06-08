
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

// Get single tag by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tags WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// Create new tag
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO tags (name, color, description) VALUES (?, ?, ?)',
      [name, color || '#3B82F6', description || '']
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      color: color || '#3B82F6', 
      description: description || '' 
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Tag name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }
});

// Update tag
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const tagId = req.params.id;
    
    // Check if tag exists
    const [existing] = await pool.execute('SELECT * FROM tags WHERE id = ?', [tagId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Update tag
    await pool.execute(
      'UPDATE tags SET name = ?, color = ?, description = ? WHERE id = ?',
      [name, color, description, tagId]
    );
    
    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Tag name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update tag' });
    }
  }
});

// Delete tag
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const tagId = req.params.id;
    
    // Check if tag exists
    const [existing] = await pool.execute('SELECT * FROM tags WHERE id = ?', [tagId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Check if tag is being used in records
    const [usage] = await pool.execute('SELECT COUNT(*) as count FROM record_tags WHERE tagId = ?', [tagId]);
    if (usage[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete tag that is in use by records' });
    }
    
    // Delete tag
    await pool.execute('DELETE FROM tags WHERE id = ?', [tagId]);
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

module.exports = router;
