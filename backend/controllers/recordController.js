
const pool = require('../config/db');

// Get all records with enhanced filtering and access control
const getAllRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const userInfo = req.user;
    
    console.log('User info:', userInfo);
    console.log('Query params:', req.query);
    
    let baseQuery = `
      SELECT 
        r.*,
        d.name as department,
        u.name as creatorName,
        fp.name as financialPeriodName,
        JSON_ARRAYAGG(
          CASE 
            WHEN t.id IS NOT NULL 
            THEN JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color, 'description', t.description)
            ELSE NULL 
          END
        ) as tags
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      LEFT JOIN users u ON r.createdBy = u.id
      LEFT JOIN financial_periods fp ON r.financialPeriodId = fp.id
      LEFT JOIN record_tags rt ON r.id = rt.recordId
      LEFT JOIN tags t ON rt.tagId = t.id
    `;
    
    const conditions = [];
    const params = [];
    
    // Access control based on user permissions
    if (!userInfo.isAdmin) {
      conditions.push(`(
        r.accessLevel = 'PUBLIC' OR 
        (r.accessLevel = 'DEPARTMENT' AND r.departmentId = ?) OR
        (r.accessLevel = 'RESTRICTED' AND (r.createdBy = ? OR JSON_CONTAINS(r.allowedUsers, ?))) OR
        (r.accessLevel = 'CONFIDENTIAL' AND r.createdBy = ?)
      )`);
      params.push(userInfo.departmentId, userId, `"${userId}"`, userId);
    }
    
    // Search term filter
    if (req.query.searchTerm) {
      conditions.push(`(r.title LIKE ? OR r.textRecord LIKE ? OR r.outline LIKE ?)`);
      const searchPattern = `%${req.query.searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Department filter
    if (req.query.department) {
      conditions.push(`r.departmentId = ?`);
      params.push(req.query.department);
    }
    
    // Financial period filter
    if (req.query.financialPeriod) {
      conditions.push(`r.financialPeriodId = ?`);
      params.push(req.query.financialPeriod);
    }
    
    // Date range filters
    if (req.query.dateFrom) {
      conditions.push(`r.date >= ?`);
      params.push(req.query.dateFrom);
    }
    
    if (req.query.dateTo) {
      conditions.push(`r.date <= ?`);
      params.push(req.query.dateTo);
    }
    
    // Created by filter
    if (req.query.createdBy) {
      conditions.push(`r.createdBy = ?`);
      params.push(req.query.createdBy);
    }
    
    // Access level filter
    if (req.query.accessLevel) {
      conditions.push(`r.accessLevel = ?`);
      params.push(req.query.accessLevel);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Group by and order
    baseQuery += ` GROUP BY r.id ORDER BY r.date DESC`;
    
    console.log('Final query:', baseQuery);
    console.log('Query params:', params);
    
    const [rows] = await pool.execute(baseQuery, params);
    
    // Process the results to clean up tags
    const processedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.filter(tag => tag !== null) : [],
      participants: row.participants ? JSON.parse(row.participants) : [],
      allowedDepartments: row.allowedDepartments ? JSON.parse(row.allowedDepartments) : [],
      allowedUsers: row.allowedUsers ? JSON.parse(row.allowedUsers) : []
    }));
    
    // Apply tag filter after processing (since we need to check the actual tag IDs)
    let filteredRows = processedRows;
    if (req.query.tags && Array.isArray(req.query.tags) && req.query.tags.length > 0) {
      filteredRows = processedRows.filter(record => {
        const recordTagIds = record.tags.map(tag => tag.id.toString());
        return req.query.tags.some(tagId => recordTagIds.includes(tagId.toString()));
      });
    }
    
    console.log(`Returning ${filteredRows.length} records`);
    res.json(filteredRows);
    
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records', details: error.message });
  }
};

// Get single record by ID with access control
const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userInfo = req.user;
    
    let query = `
      SELECT 
        r.*,
        d.name as department,
        u.name as creatorName,
        fp.name as financialPeriodName,
        JSON_ARRAYAGG(
          CASE 
            WHEN t.id IS NOT NULL 
            THEN JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color, 'description', t.description)
            ELSE NULL 
          END
        ) as tags
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      LEFT JOIN users u ON r.createdBy = u.id
      LEFT JOIN financial_periods fp ON r.financialPeriodId = fp.id
      LEFT JOIN record_tags rt ON r.id = rt.recordId
      LEFT JOIN tags t ON rt.tagId = t.id
      WHERE r.id = ?
    `;
    
    const params = [id];
    
    // Add access control for non-admin users
    if (!userInfo.isAdmin) {
      query += ` AND (
        r.accessLevel = 'PUBLIC' OR 
        (r.accessLevel = 'DEPARTMENT' AND r.departmentId = ?) OR
        (r.accessLevel = 'RESTRICTED' AND (r.createdBy = ? OR JSON_CONTAINS(r.allowedUsers, ?))) OR
        (r.accessLevel = 'CONFIDENTIAL' AND r.createdBy = ?)
      )`;
      params.push(userInfo.departmentId, userId, `"${userId}"`, userId);
    }
    
    query += ` GROUP BY r.id`;
    
    const [rows] = await pool.execute(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }
    
    const record = {
      ...rows[0],
      tags: rows[0].tags ? rows[0].tags.filter(tag => tag !== null) : [],
      participants: rows[0].participants ? JSON.parse(rows[0].participants) : [],
      allowedDepartments: rows[0].allowedDepartments ? JSON.parse(rows[0].allowedDepartments) : [],
      allowedUsers: rows[0].allowedUsers ? JSON.parse(rows[0].allowedUsers) : []
    };
    
    res.json(record);
    
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: 'Failed to fetch record', details: error.message });
  }
};

// Get record changes/history
const getRecordChanges = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        rc.*,
        u.name as changedByName
      FROM record_changes rc
      LEFT JOIN users u ON rc.changedBy = u.id
      WHERE rc.recordId = ?
      ORDER BY rc.createdAt DESC
    `;
    
    const [rows] = await pool.execute(query, [id]);
    res.json(rows);
    
  } catch (error) {
    console.error('Error fetching record changes:', error);
    res.status(500).json({ error: 'Failed to fetch record changes' });
  }
};

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
      importFromAI,
      videoLink,
      textRecord,
      outline,
      remark,
      financialPeriodId,
      accessLevel,
      allowedDepartments,
      allowedUsers,
      tags
    } = req.body;
    
    // Insert the record
    const insertQuery = `
      INSERT INTO records (
        date, duration, departmentId, title, participants, importFromAI,
        videoLink, textRecord, outline, remark, createdBy, financialPeriodId,
        accessLevel, allowedDepartments, allowedUsers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(insertQuery, [
      date,
      duration,
      departmentId || userInfo.departmentId,
      title,
      JSON.stringify(participants || []),
      importFromAI || false,
      videoLink || '',
      textRecord || '',
      outline || '',
      remark || '',
      userId,
      financialPeriodId,
      accessLevel || 'DEPARTMENT',
      JSON.stringify(allowedDepartments || []),
      JSON.stringify(allowedUsers || [])
    ]);
    
    const recordId = result.insertId;
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagInserts = tags.map(tagId => [recordId, tagId]);
      await pool.execute(
        `INSERT INTO record_tags (recordId, tagId) VALUES ${tags.map(() => '(?, ?)').join(', ')}`,
        tagInserts.flat()
      );
    }
    
    // Log the change
    await pool.execute(
      `INSERT INTO record_changes (recordId, changedBy, changeType, changeDescription) VALUES (?, ?, ?, ?)`,
      [recordId, userId, 'CREATE', `Created new record: ${title}`]
    );
    
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
    
    // First check if user has permission to update this record
    const checkQuery = `
      SELECT * FROM records 
      WHERE id = ? AND (createdBy = ? OR ? = true)
    `;
    
    const [existingRecords] = await pool.execute(checkQuery, [id, userId, userInfo.isAdmin]);
    
    if (existingRecords.length === 0) {
      return res.status(403).json({ error: 'Permission denied to update this record' });
    }
    
    const existingRecord = existingRecords[0];
    
    const {
      date,
      duration,
      departmentId,
      title,
      participants,
      importFromAI,
      videoLink,
      textRecord,
      outline,
      remark,
      financialPeriodId,
      accessLevel,
      allowedDepartments,
      allowedUsers,
      tags
    } = req.body;
    
    // Update the record
    const updateQuery = `
      UPDATE records SET 
        date = ?, duration = ?, departmentId = ?, title = ?, participants = ?,
        importFromAI = ?, videoLink = ?, textRecord = ?, outline = ?, remark = ?,
        financialPeriodId = ?, accessLevel = ?, allowedDepartments = ?, allowedUsers = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await pool.execute(updateQuery, [
      date,
      duration,
      departmentId,
      title,
      JSON.stringify(participants || []),
      importFromAI || false,
      videoLink || '',
      textRecord || '',
      outline || '',
      remark || '',
      financialPeriodId,
      accessLevel,
      JSON.stringify(allowedDepartments || []),
      JSON.stringify(allowedUsers || []),
      id
    ]);
    
    // Update tags
    if (tags !== undefined) {
      // Remove existing tags
      await pool.execute('DELETE FROM record_tags WHERE recordId = ?', [id]);
      
      // Add new tags
      if (Array.isArray(tags) && tags.length > 0) {
        const tagInserts = tags.map(tagId => [id, tagId]);
        await pool.execute(
          `INSERT INTO record_tags (recordId, tagId) VALUES ${tags.map(() => '(?, ?)').join(', ')}`,
          tagInserts.flat()
        );
      }
    }
    
    // Log the change
    await pool.execute(
      `INSERT INTO record_changes (recordId, changedBy, changeType, changeDescription) VALUES (?, ?, ?, ?)`,
      [id, userId, 'UPDATE', `Updated record: ${title}`]
    );
    
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
    
    // Check if user has permission to delete this record
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
    await pool.execute(
      `INSERT INTO record_changes (recordId, changedBy, changeType, changeDescription) VALUES (?, ?, ?, ?)`,
      [id, userId, 'DELETE', `Deleted record: ${title}`]
    );
    
    // Delete the record (this will cascade delete tags and changes due to foreign key constraints)
    await pool.execute('DELETE FROM records WHERE id = ?', [id]);
    
    res.json({ message: 'Record deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record', details: error.message });
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  getRecordChanges,
  createRecord,
  updateRecord,
  deleteRecord
};
