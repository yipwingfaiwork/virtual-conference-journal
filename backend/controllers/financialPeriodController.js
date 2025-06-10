
const pool = require('../config/db');

// Get all financial periods
exports.getAllFinancialPeriods = async (req, res) => {
  try {
    const [periods] = await pool.execute(
      'SELECT * FROM financial_periods ORDER BY startDate DESC'
    );
    res.json(periods);
  } catch (error) {
    console.error('Error fetching financial periods:', error);
    res.status(500).json({ error: 'Failed to fetch financial periods' });
  }
};

// Get financial period by ID
exports.getFinancialPeriodById = async (req, res) => {
  try {
    const { id } = req.params;
    const [periods] = await pool.execute(
      'SELECT * FROM financial_periods WHERE id = ?',
      [id]
    );
    
    if (periods.length === 0) {
      return res.status(404).json({ error: 'Financial period not found' });
    }
    
    res.json(periods[0]);
  } catch (error) {
    console.error('Error fetching financial period:', error);
    res.status(500).json({ error: 'Failed to fetch financial period' });
  }
};

// Create new financial period
exports.createFinancialPeriod = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, startDate, endDate, description } = req.body;
    
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Name, start date, and end date are required' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO financial_periods (name, startDate, endDate, description) VALUES (?, ?, ?, ?)',
      [name, startDate, endDate, description || null]
    );
    
    const [periods] = await pool.execute(
      'SELECT * FROM financial_periods WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(periods[0]);
  } catch (error) {
    console.error('Error creating financial period:', error);
    res.status(500).json({ error: 'Failed to create financial period' });
  }
};

// Update financial period
exports.updateFinancialPeriod = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { name, startDate, endDate, description } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE financial_periods SET name = ?, startDate = ?, endDate = ?, description = ? WHERE id = ?',
      [name, startDate, endDate, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Financial period not found' });
    }
    
    const [periods] = await pool.execute(
      'SELECT * FROM financial_periods WHERE id = ?',
      [id]
    );
    
    res.json(periods[0]);
  } catch (error) {
    console.error('Error updating financial period:', error);
    res.status(500).json({ error: 'Failed to update financial period' });
  }
};

// Delete financial period
exports.deleteFinancialPeriod = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM financial_periods WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Financial period not found' });
    }
    
    res.json({ message: 'Financial period deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial period:', error);
    res.status(500).json({ error: 'Failed to delete financial period' });
  }
};
