
const pool = require('../config/db');

// Get all activity logs with pagination and filters
const getAllActivityLogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0, recordId, userId, action } = req.query;
    
    let query = `
      SELECT 
        al.*,
        u.name as userName,
        r.title as recordTitle
      FROM activity_logs al
      LEFT JOIN users u ON al.userId = u.id
      LEFT JOIN records r ON al.recordId = r.id
      WHERE 1=1
    `;
    const params = [];
    
    // Add filters
    if (recordId) {
      query += ` AND al.recordId = ?`;
      params.push(recordId);
    }
    
    if (userId) {
      query += ` AND al.userId = ?`;
      params.push(userId);
    }
    
    if (action) {
      query += ` AND al.action = ?`;
      params.push(action);
    }
    
    query += ` ORDER BY al.timestamp DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    console.log('Activity logs query:', query);
    console.log('Activity logs params:', params);
    
    const [rows] = await pool.query(query, params);
    
    console.log(`Returning ${rows.length} activity logs`);
    res.json(rows);
    
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs', details: error.message });
  }
};

module.exports = {
  getAllActivityLogs
};
