
const { pool } = require('../config/db');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    console.log('Fetching all departments...');
    const [rows] = await pool.execute('SELECT * FROM departments ORDER BY name');
    console.log('Departments fetched successfully:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch departments',
      details: error.message 
    });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching department by ID:', id);
    
    const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    console.log('Department fetched successfully:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ 
      error: 'Failed to fetch department',
      details: error.message 
    });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log('Creating new department:', { name, description });
    
    const [result] = await pool.execute(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    console.log('Department created successfully with ID:', result.insertId);
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      description,
      message: 'Department created successfully' 
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ 
      error: 'Failed to create department',
      details: error.message 
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    console.log('Updating department:', { id, name, description });
    
    const [result] = await pool.execute(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    console.log('Department updated successfully');
    res.json({ 
      id, 
      name, 
      description,
      message: 'Department updated successfully' 
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ 
      error: 'Failed to update department',
      details: error.message 
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting department:', id);
    
    const [result] = await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    console.log('Department deleted successfully');
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ 
      error: 'Failed to delete department',
      details: error.message 
    });
  }
};
