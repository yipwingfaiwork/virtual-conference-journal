
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

// Get all departments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM departments ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get single department by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Create new department (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      description: description || '' 
    });
  } catch (error) {
    console.error('Error creating department:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Department name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create department' });
    }
  }
});

// Update department (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { name, description } = req.body;
    const departmentId = req.params.id;
    
    // Check if department exists
    const [existing] = await pool.execute('SELECT * FROM departments WHERE id = ?', [departmentId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Update department
    await pool.execute(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, departmentId]
    );
    
    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Error updating department:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Department name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update department' });
    }
  }
});

// Delete department (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const departmentId = req.params.id;
    
    // Check if department exists
    const [existing] = await pool.execute('SELECT * FROM departments WHERE id = ?', [departmentId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Check if department is being used by users
    const [userUsage] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE department = ?', [existing[0].name]);
    if (userUsage[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete department that is assigned to users' });
    }
    
    // Check if department is being used by records
    const [recordUsage] = await pool.execute('SELECT COUNT(*) as count FROM conference_records WHERE department = ?', [existing[0].name]);
    if (recordUsage[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete department that has associated records' });
    }
    
    // Delete department
    await pool.execute('DELETE FROM departments WHERE id = ?', [departmentId]);
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

module.exports = router;
