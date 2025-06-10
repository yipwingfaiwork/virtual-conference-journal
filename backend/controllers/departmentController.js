
const pool = require('../config/db');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await pool.execute('SELECT * FROM departments ORDER BY name');
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [departments] = await pool.execute('SELECT * FROM departments WHERE id = ?', [id]);
    
    if (departments.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(departments[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    const [departments] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(departments[0]);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { name, description } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    const [departments] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );
    
    res.json(departments[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};
