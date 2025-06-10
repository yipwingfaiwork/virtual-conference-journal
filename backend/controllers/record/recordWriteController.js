const pool = require('../../config/db');
const { logActivity } = require('../../utils/logger');

// Create new record
exports.createRecord = async (req, res) => {
  try {
    const {
      date,
      duration,
      departmentId,
      title,
      participants,
      videoLink,
      textRecord,
      outline,
      isPublic,
      isConfidential,
      financialPeriodId,
      tags
    } = req.body;

    console.log('Creating record with data:', {
      date, duration, departmentId, title, 
      participantsCount: participants?.length,
      userId: req.user.userId
    });

    // Validate required fields
    if (!date || !title) {
      return res.status(400).json({ error: 'Date and title are required' });
    }

    // Create the record
    const [result] = await pool.execute(
      `INSERT INTO records (
        date, duration, departmentId, title, participants, 
        videoLink, textRecord, outline, isPublic, isConfidential, 
        createdBy, financialPeriodId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        duration || null,
        departmentId || null,
        title,
        JSON.stringify(participants || []),
        videoLink || null,
        textRecord || '',
        outline || '',
        isPublic !== false,
        isConfidential === true,
        req.user.userId,
        financialPeriodId || null
      ]
    );

    const recordId = result.insertId;
    console.log('Record created with ID:', recordId);

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagQueries = tags.map(tagId => 
        pool.execute('INSERT INTO record_tags (recordId, tagId) VALUES (?, ?)', [recordId, tagId])
      );
      await Promise.all(tagQueries);
      console.log('Tags added to record:', tags);
    }

    // Log activity
    await logActivity(req.user.userId, 'CREATE_RECORD', `Created record: ${title}`);

    // Get the created record with department and creator info
    const [records] = await pool.execute(`
      SELECT 
        r.id, r.date, r.duration, r.departmentId, r.title, r.participants,
        r.videoLink, r.textRecord, r.outline, r.isPublic, r.isConfidential,
        r.createdBy, r.financialPeriodId, r.createdAt, r.updatedAt,
        d.name as department,
        u.name as creatorName,
        fp.name as financialPeriod
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      LEFT JOIN users u ON r.createdBy = u.id
      LEFT JOIN financial_periods fp ON r.financialPeriodId = fp.id
      WHERE r.id = ?
    `, [recordId]);

    // Get tags for this record
    const [recordTags] = await pool.execute(`
      SELECT t.id, t.name, t.color
      FROM tags t
      JOIN record_tags rt ON t.id = rt.tagId
      WHERE rt.recordId = ?
    `, [recordId]);

    const record = {
      ...records[0],
      tags: recordTags
    };

    console.log('Record creation successful');
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating record:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlState: error.sqlState
    });
    res.status(500).json({ error: 'Failed to create record' });
  }
};

// Update existing record
exports.updateRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const {
      date,
      duration,
      departmentId,
      title,
      participants,
      videoLink,
      textRecord,
      outline,
      isPublic,
      isConfidential,
      financialPeriodId,
      tags
    } = req.body;

    // Check if record exists
    const [existingRecords] = await pool.execute('SELECT * FROM records WHERE id = ?', [recordId]);
    
    if (existingRecords.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const existingRecord = existingRecords[0];

    // Check permissions
    if (existingRecord.createdBy !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to update this record' });
    }

    // Update the record
    await pool.execute(
      `UPDATE records SET 
        date = ?, duration = ?, departmentId = ?, title = ?, participants = ?,
        videoLink = ?, textRecord = ?, outline = ?, isPublic = ?, isConfidential = ?,
        financialPeriodId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        date,
        duration || null,
        departmentId || null,
        title,
        JSON.stringify(participants || []),
        videoLink || null,
        textRecord || '',
        outline || '',
        isPublic !== false,
        isConfidential === true,
        financialPeriodId || null,
        recordId
      ]
    );

    // Update tags
    if (tags !== undefined) {
      // Remove existing tags
      await pool.execute('DELETE FROM record_tags WHERE recordId = ?', [recordId]);
      
      // Add new tags
      if (Array.isArray(tags) && tags.length > 0) {
        const tagQueries = tags.map(tagId => 
          pool.execute('INSERT INTO record_tags (recordId, tagId) VALUES (?, ?)', [recordId, tagId])
        );
        await Promise.all(tagQueries);
      }
    }

    // Log activity
    await logActivity(req.user.userId, 'UPDATE_RECORD', `Updated record: ${title}`);

    // Get the updated record
    const [records] = await pool.execute(`
      SELECT 
        r.id, r.date, r.duration, r.departmentId, r.title, r.participants,
        r.videoLink, r.textRecord, r.outline, r.isPublic, r.isConfidential,
        r.createdBy, r.financialPeriodId, r.createdAt, r.updatedAt,
        d.name as department,
        u.name as creatorName,
        fp.name as financialPeriod
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      LEFT JOIN users u ON r.createdBy = u.id
      LEFT JOIN financial_periods fp ON r.financialPeriodId = fp.id
      WHERE r.id = ?
    `, [recordId]);

    // Get tags for this record
    const [recordTags] = await pool.execute(`
      SELECT t.id, t.name, t.color
      FROM tags t
      JOIN record_tags rt ON t.id = rt.tagId
      WHERE rt.recordId = ?
    `, [recordId]);

    const record = {
      ...records[0],
      tags: recordTags
    };

    res.json(record);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
};

// Delete record
exports.deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;

    // Check if record exists
    const [existingRecords] = await pool.execute('SELECT * FROM records WHERE id = ?', [recordId]);
    
    if (existingRecords.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const existingRecord = existingRecords[0];

    // Check permissions (only admin can delete records)
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Only administrators can delete records.' });
    }

    // Delete the record (cascade will handle record_tags)
    await pool.execute('DELETE FROM records WHERE id = ?', [recordId]);

    // Log activity
    await logActivity(req.user.userId, 'DELETE_RECORD', `Deleted record: ${existingRecord.title}`);

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
};
