
const pool = require('../../config/db');
const RecordService = require('../../services/recordService');
const TagService = require('../../services/tagService');
const ActivityLogService = require('../../services/activityLogService');

// Create new record
const createRecord = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      date,
      textRecord,
      outline,
      duration,
      participants,
      department,
      departmentId,
      financialPeriodId,
      tags,
      accessLevel,
      videoLink,
      remark,
      aiTranslate
    } = req.body;

    console.log('Create record request body:', req.body);

    // Handle department mapping
    let finalDepartmentId = departmentId;
    
    if (!finalDepartmentId && department) {
      const departmentMap = {
        'Operations': '1',
        'Finance': '2', 
        'Management': '3',
        'Administration': '4'
      };
      finalDepartmentId = departmentMap[department];
    }

    if (!finalDepartmentId) {
      finalDepartmentId = req.user.departmentId;
    }

    console.log('Final departmentId:', finalDepartmentId);

    // Map access level to database fields
    const { isPublic, isConfidential } = RecordService.mapAccessLevel(accessLevel);

    const insertQuery = `
      INSERT INTO records (
        title, date, textRecord, outline, duration, participants,
        departmentId, financialPeriodId, isPublic, isConfidential, 
        createdBy, videoLink, remark, aiTranslate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const participantsJson = participants ? JSON.stringify(participants) : null;

    const [result] = await pool.query(insertQuery, [
      title, date, textRecord, outline, duration, participantsJson,
      finalDepartmentId, financialPeriodId, isPublic, isConfidential, 
      userId, videoLink || null, remark || null, aiTranslate || false
    ]);

    const recordId = result.insertId;

    // Handle tags
    await TagService.handleRecordTags(recordId, tags);

    // Log activity
    await ActivityLogService.logActivity(
      userId,
      'RECORD_CREATE',
      `Created record: ${title}`,
      recordId
    );

    res.status(201).json({
      message: 'Record created successfully',
      recordId
    });

  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
};

// Update existing record
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // Check permission
    const hasPermission = await RecordService.checkModifyPermission(id, userId, isAdmin);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const {
      title,
      date,
      textRecord,
      outline,
      duration,
      participants,
      department,
      departmentId,
      financialPeriodId,
      tags,
      accessLevel,
      videoLink,
      remark,
      aiTranslate
    } = req.body;

    // Handle department mapping
    let finalDepartmentId = departmentId;
    
    if (!finalDepartmentId && department) {
      const departmentMap = {
        'Operations': '1',
        'Finance': '2',
        'Management': '3',
        'Administration': '4'
      };
      finalDepartmentId = departmentMap[department];
    }

    // Map access level to database fields
    const { isPublic, isConfidential } = RecordService.mapAccessLevel(accessLevel);

    const updateQuery = `
      UPDATE records SET
        title = ?, date = ?, textRecord = ?, outline = ?, duration = ?,
        participants = ?, departmentId = ?, financialPeriodId = ?,
        isPublic = ?, isConfidential = ?, videoLink = ?, remark = ?,
        aiTranslate = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const participantsJson = participants ? JSON.stringify(participants) : null;

    await pool.query(updateQuery, [
      title, date, textRecord, outline, duration, participantsJson,
      finalDepartmentId, financialPeriodId, isPublic, isConfidential, 
      videoLink || null, remark || null, aiTranslate || false, id
    ]);

    // Remove existing tags and add new ones
    await TagService.removeRecordTags(id);
    await TagService.handleRecordTags(id, tags);

    // Log activity
    await ActivityLogService.logActivity(
      userId,
      'RECORD_UPDATE',
      `Updated record: ${title}`,
      id
    );

    res.json({ message: 'Record updated successfully' });

  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
};

// Delete record
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // Check permission
    const hasPermission = await RecordService.checkModifyPermission(id, userId, isAdmin);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Get record title for logging
    const [recordRows] = await pool.query('SELECT title FROM records WHERE id = ?', [id]);
    const recordTitle = recordRows[0]?.title || 'Unknown';

    // Remove tags first
    await TagService.removeRecordTags(id);

    // Delete the record
    await pool.query('DELETE FROM records WHERE id = ?', [id]);

    // Log activity
    await ActivityLogService.logActivity(
      userId,
      'RECORD_DELETE',
      `Deleted record: ${recordTitle}`,
      id
    );

    res.json({ message: 'Record deleted successfully' });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
};

module.exports = {
  createRecord,
  updateRecord,
  deleteRecord
};
