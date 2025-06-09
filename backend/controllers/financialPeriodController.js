
const { pool } = require('../config/db');

// Get all financial periods
exports.getAllFinancialPeriods = async (req, res) => {
  try {
    console.log('Fetching all financial periods...');
    const [rows] = await pool.execute('SELECT * FROM financial_periods ORDER BY startDate DESC');
    console.log('Financial periods fetched successfully:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching financial periods:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial periods',
      details: error.message 
    });
  }
};

// Get financial period by ID
exports.getFinancialPeriodById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching financial period by ID:', id);
    
    const [rows] = await pool.execute('SELECT * FROM financial_periods WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Financial period not found' });
    }
    
    console.log('Financial period fetched successfully:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching financial period:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial period',
      details: error.message 
    });
  }
};

// Create new financial period
exports.createFinancialPeriod = async (req, res) => {
  try {
    const { name, startDate, endDate, description } = req.body;
    console.log('Creating new financial period:', { name, startDate, endDate, description });
    
    const [result] = await pool.execute(
      'INSERT INTO financial_periods (name, startDate, endDate, description) VALUES (?, ?, ?, ?)',
      [name, startDate, endDate, description]
    );
    
    console.log('Financial period created successfully with ID:', result.insertId);
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      startDate,
      endDate,
      description,
      message: 'Financial period created successfully' 
    });
  } catch (error) {
    console.error('Error creating financial period:', error);
    res.status(500).json({ 
      error: 'Failed to create financial period',
      details: error.message 
    });
  }
};

// Update financial period
exports.updateFinancialPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, description } = req.body;
    console.log('Updating financial period:', { id, name, startDate, endDate, description });
    
    const [result] = await pool.execute(
      'UPDATE financial_periods SET name = ?, startDate = ?, endDate = ?, description = ? WHERE id = ?',
      [name, startDate, endDate, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Financial period not found' });
    }
    
    console.log('Financial period updated successfully');
    res.json({ 
      id, 
      name, 
      startDate,
      endDate,
      description,
      message: 'Financial period updated successfully' 
    });
  } catch (error) {
    console.error('Error updating financial period:', error);
    res.status(500).json({ 
      error: 'Failed to update financial period',
      details: error.message 
    });
  }
};

// Delete financial period
exports.deleteFinancialPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting financial period:', id);
    
    const [result] = await pool.execute('DELETE FROM financial_periods WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Financial period not found' });
    }
    
    console.log('Financial period deleted successfully');
    res.json({ message: 'Financial period deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial period:', error);
    res.status(500).json({ 
      error: 'Failed to delete financial period',
      details: error.message 
    });
  }
};
