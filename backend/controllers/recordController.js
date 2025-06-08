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
    
    // Simplified access control - admin can see all, others based on public/confidential flags
    if (!userInfo.isAdmin) {
      conditions.push(`(
        r.isPublic = true OR 
        (r.isPublic = false AND r.isConfidential = false AND r.departmentId = ?) OR
        r.createdBy = ?
      )`);
      params.push(userInfo.departmentId, userId);
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
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Group by and order
    baseQuery += ` GROUP BY r.id ORDER BY r.date DESC`;
    
    console.log('Final query:', baseQuery);
    console.log('Query params:', params);
    
    const [rows] = await pool.execute(baseQuery, params);
    
    // Process the results to clean up tags and add computed fields
    const processedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.filter(tag => tag !== null) : [],
      participants: row.participants ? JSON.parse(row.participants) : [],
      // Map the simplified access control to the expected frontend format
      accessLevel: row.isPublic ? 'PUBLIC' : (row.isConfidential ? 'CONFIDENTIAL' : 'DEPARTMENT'),
      allowedDepartments: [],
      allowedUsers: []
    }));
    
    // Apply tag filter after processing
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
    
    // Simplified access control for single record
    if (!userInfo.isAdmin) {
      query += ` AND (
        r.isPublic = true OR 
        (r.isPublic = false AND r.isConfidential = false AND r.departmentId = ?) OR
        r.createdBy = ?
      )`;
      params.push(userInfo.departmentId, userId);
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
      // Map simplified access control to frontend format
      accessLevel: rows[0].isPublic ? 'PUBLIC' : (rows[0].isConfidential ? 'CONFIDENTIAL' : 'DEPARTMENT'),
      allowedDepartments: [],
      allowedUsers: []
    };
    
    res.json(record);
    
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: 'Failed to fetch record', details: error.message });
  }
};

// Get record changes/history - simplified since we removed record_changes table
const getRecordChanges = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Since we removed record_changes table, get activity logs instead
    const query = `
      SELECT 
        al.*,
        u.name as changedByName
      FROM activity_logs al
      LEFT JOIN users u ON al.userId = u.id
      WHERE al.recordId = ?
      ORDER BY al.timestamp DESC
    `;
    
    const [rows] = await pool.execute(query, [id]);
    
    // Map activity logs to change format expected by frontend
    const changes = rows.map(row => ({
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
    
    res.json(changes);
    
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
      videoLink,
      textRecord,
      outline,
      remark,
      financialPeriodId,
      accessLevel,
      tags
    } = req.body;
    
    // Handle tags if they come as JSON string from frontend
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    // Map frontend accessLevel to simplified database fields
    const isPublic = accessLevel === 'PUBLIC';
    const isConfidential = accessLevel === 'CONFIDENTIAL';
    
    // Insert the record with simplified access control
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
    if (parsedTags && Array.isArray(parsedTags) && parsedTags.length > 0) {
      for (const tag of parsedTags) {
        let tagId = tag.id;
        
        // If tag doesn't have an ID, create it
        if (!tagId || tagId === '') {
          const [tagResult] = await pool.execute(
            'INSERT INTO tags (name, color, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [tag.name, tag.color || '#3B82F6', tag.description || '']
          );
          tagId = tagResult.insertId;
        }
        
        // Link tag to record
        await pool.execute(
          'INSERT IGNORE INTO record_tags (recordId, tagId) VALUES (?, ?)',
          [recordId, tagId]
        );
      }
    }
    
    // Log the activity
    await pool.execute(
      `INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)`,
      [userId, 'CREATE_RECORD', `Created new record: ${title}`, recordId]
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
    
    // Check if user has permission to update this record
    const checkQuery = `
      SELECT * FROM records 
      WHERE id = ? AND (createdBy = ? OR ? = true)
    `;
    
    const [existingRecords] = await pool.execute(checkQuery, [id, userId, userInfo.isAdmin]);
    
    if (existingRecords.length === 0) {
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
    
    // Handle tags if they come as JSON string from frontend
    let parsedTags = [];
    if (tags !== undefined) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    // Map frontend accessLevel to simplified database fields
    const isPublic = accessLevel === 'PUBLIC';
    const isConfidential = accessLevel === 'CONFIDENTIAL';
    
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
      // Remove existing tags
      await pool.execute('DELETE FROM record_tags WHERE recordId = ?', [id]);
      
      // Add new tags
      if (Array.isArray(parsedTags) && parsedTags.length > 0) {
        for (const tag of parsedTags) {
          let tagId = tag.id;
          
          // If tag doesn't have an ID, create it
          if (!tagId || tagId === '') {
            const [tagResult] = await pool.execute(
              'INSERT INTO tags (name, color, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
              [tag.name, tag.color || '#3B82F6', tag.description || '']
            );
            tagId = tagResult.insertId;
          }
          
          // Link tag to record
          await pool.execute(
            'INSERT IGNORE INTO record_tags (recordId, tagId) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }
    
    // Log the activity
    await pool.execute(
      `INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)`,
      [userId, 'UPDATE_RECORD', `Updated record: ${title}`, id]
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
      `INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)`,
      [userId, 'DELETE_RECORD', `Deleted record: ${title}`, id]
    );
    
    // Delete the record (this will cascade delete tags due to foreign key constraints)
    await pool.execute('DELETE FROM records WHERE id = ?', [id]);
    
    res.json({ message: 'Record deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record', details: error.message });
  }
};

module.exports = {
  getAllRecords,
  getRecordById: async (req, res) => {
    // Get single record by ID with access control
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
      
      // Simplified access control for single record
      if (!userInfo.isAdmin) {
        query += ` AND (
          r.isPublic = true OR 
          (r.isPublic = false AND r.isConfidential = false AND r.departmentId = ?) OR
          r.createdBy = ?
        )`;
        params.push(userInfo.departmentId, userId);
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
        // Map simplified access control to frontend format
        accessLevel: rows[0].isPublic ? 'PUBLIC' : (rows[0].isConfidential ? 'CONFIDENTIAL' : 'DEPARTMENT'),
        allowedDepartments: [],
        allowedUsers: []
      };
      
      res.json(record);
      
    } catch (error) {
      console.error('Error fetching record:', error);
      res.status(500).json({ error: 'Failed to fetch record', details: error.message });
    }
  },
  getRecordChanges: async (req, res) => {
    // Get record changes/history - simplified since we removed record_changes table
    try {
      const { id } = req.params;
      
      // Since we removed record_changes table, get activity logs instead
      const query = `
        SELECT 
          al.*,
          u.name as changedByName
        FROM activity_logs al
        LEFT JOIN users u ON al.userId = u.id
        WHERE al.recordId = ?
        ORDER BY al.timestamp DESC
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      // Map activity logs to change format expected by frontend
      const changes = rows.map(row => ({
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
      
      res.json(changes);
      
    } catch (error) {
      console.error('Error fetching record changes:', error);
      res.status(500).json({ error: 'Failed to fetch record changes' });
    }
  },
  updateRecord: async (req, res) => {
    // Update record
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userInfo = req.user;
      
      // Check if user has permission to update this record
      const checkQuery = `
        SELECT * FROM records 
        WHERE id = ? AND (createdBy = ? OR ? = true)
      `;
      
      const [existingRecords] = await pool.execute(checkQuery, [id, userId, userInfo.isAdmin]);
      
      if (existingRecords.length === 0) {
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
      
      // Handle tags if they come as JSON string from frontend
      let parsedTags = [];
      if (tags !== undefined) {
        try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Map frontend accessLevel to simplified database fields
      const isPublic = accessLevel === 'PUBLIC';
      const isConfidential = accessLevel === 'CONFIDENTIAL';
      
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
        // Remove existing tags
        await pool.execute('DELETE FROM record_tags WHERE recordId = ?', [id]);
        
        // Add new tags
        if (Array.isArray(parsedTags) && parsedTags.length > 0) {
          for (const tag of parsedTags) {
            let tagId = tag.id;
            
            // If tag doesn't have an ID, create it
            if (!tagId || tagId === '') {
              const [tagResult] = await pool.execute(
                'INSERT INTO tags (name, color, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
                [tag.name, tag.color || '#3B82F6', tag.description || '']
              );
              tagId = tagResult.insertId;
            }
            
            // Link tag to record
            await pool.execute(
              'INSERT IGNORE INTO record_tags (recordId, tagId) VALUES (?, ?)',
              [id, tagId]
            );
          }
        }
      }
      
      // Log the activity
      await pool.execute(
        `INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)`,
        [userId, 'UPDATE_RECORD', `Updated record: ${title}`, id]
      );
      
      res.json({ message: 'Record updated successfully' });
      
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ error: 'Failed to update record', details: error.message });
    }
  },
  deleteRecord: async (req, res) => {
    // Delete record
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
        `INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)`,
        [userId, 'DELETE_RECORD', `Deleted record: ${title}`, id]
      );
      
      // Delete the record (this will cascade delete tags due to foreign key constraints)
      await pool.execute('DELETE FROM records WHERE id = ?', [id]);
      
      res.json({ message: 'Record deleted successfully' });
      
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'Failed to delete record', details: error.message });
    }
  }
};
