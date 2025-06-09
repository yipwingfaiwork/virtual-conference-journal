
const db = require('../../config/db');
const { logActivity } = require('../../utils/logger');

// Create new record
exports.createRecord = async (req, res) => {
  try {
    console.log('Creating record with body:', req.body);
    
    const {
      date, duration, department, title, participants, videoLink,
      textRecord, outline, remark, financialPeriodId, isPublic, isConfidential, tags
    } = req.body;
    
    const createdBy = req.user.userId;
    
    // Validate required fields
    if (!date || !duration || !title) {
      return res.status(400).json({ error: 'Date, duration, and title are required' });
    }
    
    // Find department ID by name if department is provided as string
    let departmentId = req.user.departmentId; // Default to user's department
    
    if (department) {
      // If department is a number, use it directly as departmentId
      if (typeof department === 'number' || !isNaN(department)) {
        departmentId = parseInt(department);
      } else {
        // If department is a string, find the department by name
        const [depts] = await db.query('SELECT id FROM departments WHERE name = ?', [department]);
        if (depts.length > 0) {
          departmentId = depts[0].id;
        }
      }
    }
    
    console.log('Using departmentId:', departmentId);
    
    // Insert record using departmentId (corrected SQL)
    const [result] = await db.query(
      `INSERT INTO records (date, duration, departmentId, title, participants, videoLink, textRecord, outline, remark, createdBy, financialPeriodId, isPublic, isConfidential) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date, duration, departmentId, title, 
        JSON.stringify(participants || []), 
        videoLink || '', textRecord || '', outline || '', remark || '',
        createdBy, financialPeriodId || null, 
        !!isPublic, !!isConfidential
      ]
    );
    
    const recordId = result.insertId;
    console.log('Created record with ID:', recordId);
    
    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await db.query(
          'INSERT IGNORE INTO record_tags (recordId, tagId) VALUES (?, ?)',
          [recordId, tagId]
        );
      }
    }
    
    // Log activity
    await logActivity(createdBy, 'CREATE_RECORD', `Created record: ${title}`, recordId);
    
    // Return the created record with complete information
    const [newRecord] = await db.query(`
      SELECT 
        r.id, r.date, r.duration, r.title, r.participants, r.videoLink,
        r.textRecord, r.outline, r.remark, r.createdBy, r.financialPeriodId,
        r.isPublic, r.isConfidential, r.createdAt, r.updatedAt,
        d.name as department, d.name as departmentName, r.departmentId,
        CASE 
          WHEN r.isPublic = 1 THEN 'PUBLIC'
          WHEN r.isConfidential = 1 THEN 'CONFIDENTIAL'
          ELSE 'DEPARTMENT'
        END as accessLevel
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      WHERE r.id = ?
    `, [recordId]);
    
    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record', details: error.message });
  }
};

// Update existing record
exports.updateRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const {
      date, duration, department, title, participants, videoLink,
      textRecord, outline, remark, financialPeriodId, isPublic, isConfidential, tags
    } = req.body;
    
    const userId = req.user.userId;
    
    // Validate required fields
    if (!date || !duration || !title) {
      return res.status(400).json({ error: 'Date, duration, and title are required' });
    }
    
    // Find department ID by name
    let departmentId = req.user.departmentId; // Default to user's department
    
    if (department) {
      // If department is a number, use it directly as departmentId
      if (typeof department === 'number' || !isNaN(department)) {
        departmentId = parseInt(department);
      } else {
        // If department is a string, find the department by name
        const [depts] = await db.query('SELECT id FROM departments WHERE name = ?', [department]);
        if (depts.length > 0) {
          departmentId = depts[0].id;
        }
      }
    }
    
    // Update record using departmentId instead of department name
    await db.query(
      `UPDATE records SET date = ?, duration = ?, departmentId = ?, title = ?, participants = ?, 
       videoLink = ?, textRecord = ?, outline = ?, remark = ?, financialPeriodId = ?, 
       isPublic = ?, isConfidential = ? WHERE id = ?`,
      [
        date, duration, departmentId, title, 
        JSON.stringify(participants || []), 
        videoLink || '', textRecord || '', outline || '', remark || '',
        financialPeriodId || null, 
        !!isPublic, !!isConfidential, recordId
      ]
    );
    
    // Clear existing tags
    await db.query('DELETE FROM record_tags WHERE recordId = ?', [recordId]);
    
    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await db.query(
          'INSERT IGNORE INTO record_tags (recordId, tagId) VALUES (?, ?)',
          [recordId, tagId]
        );
      }
    }
    
    // Log activity
    await logActivity(userId, 'UPDATE_RECORD', `Updated record: ${title}`, recordId);
    
    // Return the updated record with complete information
    const [updatedRecord] = await db.query(`
      SELECT 
        r.id, r.date, r.duration, r.title, r.participants, r.videoLink,
        r.textRecord, r.outline, r.remark, r.createdBy, r.financialPeriodId,
        r.isPublic, r.isConfidential, r.createdAt, r.updatedAt,
        d.name as department, d.name as departmentName, r.departmentId,
        CASE 
          WHEN r.isPublic = 1 THEN 'PUBLIC'
          WHEN r.isConfidential = 1 THEN 'CONFIDENTIAL'
          ELSE 'DEPARTMENT'
        END as accessLevel
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      WHERE r.id = ?
    `, [recordId]);
    
    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record', details: error.message });
  }
};

// Delete record
exports.deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.user.userId;
    
    // Check if record exists
    const [records] = await db.query('SELECT title FROM records WHERE id = ?', [recordId]);
    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const recordTitle = records[0].title;
    
    // Delete record
    await db.query('DELETE FROM records WHERE id = ?', [recordId]);
    
    // Log activity
    await logActivity(userId, 'DELETE_RECORD', `Deleted record: ${recordTitle}`, recordId);
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record', details: error.message });
  }
};
