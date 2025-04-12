
const db = require('../config/db');

// Function to log user activity
async function logActivity(userId, action, details = null, recordId = null) {
  try {
    await db.query(
      'INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)',
      [userId, action, details, recordId]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

module.exports = {
  logActivity
};
