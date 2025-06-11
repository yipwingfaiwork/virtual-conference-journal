
const pool = require('../config/db');

class ActivityLogService {
  static async logActivity(userId, action, details, recordId = null) {
    await pool.query(
      `INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)`,
      [userId, action, details, recordId]
    );
  }

  static async getRecordChanges(recordId) {
    const query = `
      SELECT 
        al.*,
        u.name as changedByName
      FROM activity_logs al
      LEFT JOIN users u ON al.userId = u.id
      WHERE al.recordId = ?
      ORDER BY al.timestamp DESC
    `;
    
    const [rows] = await pool.query(query, [recordId]);
    
    return rows.map(row => ({
      id: row.id,
      recordId: row.recordId,
      changedBy: row.userId,
      changedByName: row.changedByName || 'Unknown',
      changeType: row.action.includes('CREATE') ? 'CREATE' : 
                  row.action.includes('UPDATE') ? 'UPDATE' : 
                  row.action.includes('DELETE') ? 'DELETE' : 'UPDATE',
      changeDescription: row.details,
      createdAt: row.timestamp
    }));
  }
}

module.exports = ActivityLogService;
