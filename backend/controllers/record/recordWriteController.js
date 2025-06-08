
const pool = require('../../config/db');
const RecordService = require('../../services/recordService');
const TagService = require('../../services/tagService');
const ActivityLogService = require('../../services/activityLogService');

// Create new record
const createRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const userInfo = req.user;
    
    const {
      date,
      duration,
      departmentId,
      title,
      participants,
      videoLink,
      textRecord,
      outline,
      remark,
      financialPeriodId,
      accessLevel,
      tags
    } = req.body;
    
    // Map frontend accessLevel to database fields
    const { isPublic, isConfidential } = RecordService.mapAccessLevel(accessLevel);
    
    // Insert the record
    const insertQuery = `
      INSERT INTO records (
        date, duration, departmentId, title, participants,
        videoLink, textRecord, outline, remark, createdBy, financialPeriodId,
        isPublic, isConfidential
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(insertQuery, [
      date,
      duration,
      departmentId || userInfo.departmentId,
      title,
      JSON.stringify(participants || []),
      videoLink || '',
      textRecord || '',
      outline || '',
      remark || '',
      userId,
      financialPeriodId,
      isPublic,
      isConfidential
    ]);
    
    const recordId = result.insertId;
    
    // Handle tags
    await TagService.handleRecordTags(recordId, tags);
    
    // Log the activity
    await ActivityLogService.logActivity(userId, 'CREATE_RECORD', `Created new record: ${title}`, recordId);
    
    res.status(201).json({ id: recordId, message: 'Record created successfully' });
    
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record', details: error.message });
  }
};

// Update record
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userInfo = req.user;
    
    // Check permissions
    const hasPermission = await RecordService.checkModifyPermission(id, userId, userInfo.isAdmin);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied to update this record' });
    }
    
    const {
      date,
      duration,
      departmentId,
      title,
      participants,
      videoLink,
      textRecord,
      outline,
      remark,
      financialPeriodId,
      accessLevel,
      tags
    } = req.body;
    
    // Map frontend accessLevel to database fields
    const { isPublic, isConfidential } = RecordService.mapAccessLevel(accessLevel);
    
    // Update the record
    const updateQuery = `
      UPDATE records SET 
        date = ?, duration = ?, departmentId = ?, title = ?, participants = ?,
        videoLink = ?, textRecord = ?, outline = ?, remark = ?,
        financialPeriodId = ?, isPublic = ?, isConfidential = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await pool.execute(updateQuery, [
      date,
      duration,
      departmentId,
      title,
      JSON.stringify(participants || []),
      videoLink || '',
      textRecord || '',
      outline || '',
      remark || '',
      financialPeriodId,
      isPublic,
      isConfidential,
      id
    ]);
    
    // Update tags if provided
    if (tags !== undefined) {
      await TagService.removeRecordTags(id);
      await TagService.handleRecordTags(id, tags);
    }
    
    // Log the activity
    await ActivityLogService.logActivity(userId, 'UPDATE_RECORD', `Updated record: ${title}`, id);
    
    res.json({ message: 'Record updated successfully' });
    
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record', details: error.message });
  }
};

// Delete record
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userInfo = req.user;
    
    // Check permissions and get title
    const checkQuery = `
      SELECT title FROM records 
      WHERE id = ? AND (createdBy = ? OR ? = true)
    `;
    
    const [existingRecords] = await pool.execute(checkQuery, [id, userId, userInfo.isAdmin]);
    
    if (existingRecords.length === 0) {
      return res.status(403).json({ error: 'Permission denied to delete this record' });
    }
    
    const title = existingRecords[0].title;
    
    // Log the deletion before actually deleting
    await ActivityLogService.logActivity(userId, 'DELETE_RECORD', `Deleted record: ${title}`, id);
    
    // Delete the record (this will cascade delete tags due to foreign key constraints)
    await pool.execute('DELETE FROM records WHERE id = ?', [id]);
    
    res.json({ message: 'Record deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record', details: error.message });
  }
};

module.exports = {
  createRecord,
  updateRecord,
  deleteRecord
};
