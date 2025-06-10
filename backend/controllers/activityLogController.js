
const pool = require('../config/db');

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    // Only admins can access activity logs
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get query parameters for filtering
    const { userId, action, recordId, limit } = req.query;
    
    let query = `
      SELECT al.*, u.name as userName 
      FROM activity_logs al
      LEFT JOIN users u ON al.userId = u.id
    `;
    let params = [];
    let conditions = [];
    
    if (userId) {
      conditions.push('al.userId = ?');
      params.push(userId);
    }
    
    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }
    
    if (recordId) {
      conditions.push('al.recordId = ?');
      params.push(recordId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY al.timestamp DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(Number(limit));
    }
    
    const [logs] = await pool.execute(query, params);
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};
