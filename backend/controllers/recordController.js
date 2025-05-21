
const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Get all records
exports.getAllRecords = async (req, res) => {
  try {
    const { department } = req.query;
    
    let query = 'SELECT * FROM records';
    let params = [];
    
    if (department && department !== 'all') {
      query += ' WHERE department = ?';
      params.push(department);
    }
    
    const [results] = await db.query(query, params);
    
    // Log the view activity for general records view
    await logActivity(req.user.userId, 'VIEW_RECORDS', 'Viewed records list');
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

// Get record by ID
exports.getRecordById = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM records WHERE id = ?', [req.params.id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Log the view activity for specific record
    await logActivity(
      req.user.userId, 
      'VIEW_RECORD',
      `Viewed record: ${results[0].title}`,
      req.params.id
    );
    
    res.json(results[0]);
  } catch (error) {
    console.error(`Error fetching record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
};

// Create record
exports.createRecord = async (req, res) => {
  try {
    const { date, duration, department, title, participants, importFromAI, videoLink, textRecord, outline, remark } = req.body;
    const createdBy = req.user.userId;
    
    const [result] = await db.query(
      'INSERT INTO records (date, duration, department, title, participants, importFromAI, videoLink, textRecord, outline, remark, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [date, duration, department, title, JSON.stringify(participants), importFromAI, videoLink, textRecord, outline, remark, createdBy]
    );
    
    // Log record creation
    await logActivity(
      createdBy, 
      'CREATE_RECORD', 
      `Created new record: ${title}`,
      result.insertId
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      date, 
      duration, 
      department, 
      title, 
      participants, 
      importFromAI,
      videoLink, 
      textRecord, 
      outline,
      remark,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
};

// Update record
exports.updateRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const { date, duration, department, title, participants, importFromAI, videoLink, textRecord, outline, remark } = req.body;
    
    // Check if record exists
    const [records] = await db.query('SELECT * FROM records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const record = records[0];
    
    // Check if user has permission to update this record
    if (record.createdBy != req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to update this record' });
    }
    
    await db.query(
      'UPDATE records SET date = ?, duration = ?, department = ?, title = ?, participants = ?, importFromAI = ?, videoLink = ?, textRecord = ?, outline = ?, remark = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [date, duration, department, title, JSON.stringify(participants), importFromAI, videoLink, textRecord, outline, remark, recordId]
    );
    
    // Log record update
    await logActivity(
      req.user.userId, 
      'UPDATE_RECORD', 
      `Updated record: ${title}`,
      recordId
    );
    
    res.json({ 
      id: recordId, 
      date, 
      duration, 
      department, 
      title, 
      participants, 
      importFromAI,
      videoLink, 
      textRecord, 
      outline,
      remark,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update record' });
  }
};

// Delete record
exports.deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Check if record exists
    const [records] = await db.query('SELECT * FROM records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Only admins can delete records
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to delete records' });
    }
    
    const recordTitle = records[0].title;
    
    // Delete activity logs associated with this record first to maintain referential integrity
    await db.query('DELETE FROM activity_logs WHERE recordId = ?', [recordId]);
    
    // Now delete the record
    await db.query('DELETE FROM records WHERE id = ?', [recordId]);
    
    // Log record deletion (note: recordId is null since it's deleted)
    await logActivity(
      req.user.userId, 
      'DELETE_RECORD', 
      `Deleted record: ${recordTitle}`
    );
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(`Error deleting record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
};
