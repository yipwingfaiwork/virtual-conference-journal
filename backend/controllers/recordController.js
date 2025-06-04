
const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Enhanced permission checking
const checkRecordAccess = async (userId, recordId, accessType = 'read') => {
  const [records] = await db.query(`
    SELECT r.*, d.name as departmentName, u.accessLevel, u.departmentId, u.isAdmin
    FROM records r
    LEFT JOIN departments d ON r.departmentId = d.id
    LEFT JOIN users u ON u.id = ?
    WHERE r.id = ?
  `, [userId, recordId]);
  
  if (records.length === 0) {
    return { hasAccess: false, record: null };
  }
  
  const record = records[0];
  const user = {
    id: userId,
    accessLevel: record.accessLevel,
    departmentId: record.departmentId,
    isAdmin: record.isAdmin
  };
  
  let hasAccess = false;
  
  // Admin has full access
  if (user.isAdmin) {
    hasAccess = true;
  } else {
    switch (record.accessLevel) {
      case 'PUBLIC':
        hasAccess = true;
        break;
      case 'DEPARTMENT':
        hasAccess = user.departmentId === record.departmentId ||
                   (record.allowedDepartments && JSON.parse(record.allowedDepartments || '[]').includes(user.departmentId)) ||
                   (record.allowedUsers && JSON.parse(record.allowedUsers || '[]').includes(userId));
        break;
      case 'RESTRICTED':
        hasAccess = (record.allowedUsers && JSON.parse(record.allowedUsers || '[]').includes(userId)) ||
                   (record.allowedDepartments && JSON.parse(record.allowedDepartments || '[]').includes(user.departmentId)) ||
                   user.accessLevel >= 3;
        break;
      case 'CONFIDENTIAL':
        hasAccess = user.isAdmin || 
                   record.createdBy === userId ||
                   (record.allowedUsers && JSON.parse(record.allowedUsers || '[]').includes(userId));
        break;
    }
  }
  
  // Additional checks for write/delete access
  if (hasAccess && accessType !== 'read') {
    if (accessType === 'write') {
      hasAccess = user.isAdmin || 
                 record.createdBy === userId ||
                 (user.departmentId === record.departmentId && user.accessLevel >= 2) ||
                 (user.accessLevel >= 3 && record.allowedUsers && JSON.parse(record.allowedUsers || '[]').includes(userId));
    } else if (accessType === 'delete') {
      hasAccess = user.isAdmin || (user.accessLevel >= 3 && record.createdBy === userId);
    }
  }
  
  return { hasAccess, record };
};

// Enhanced search with filters
exports.getAllRecords = async (req, res) => {
  try {
    console.log('getAllRecords called with query:', req.query);
    
    const { 
      department, 
      searchTerm, 
      tags, 
      financialPeriod, 
      dateFrom, 
      dateTo, 
      createdBy, 
      accessLevel,
      page = 1,
      limit = 20
    } = req.query;
    
    let query = `
      SELECT DISTINCT r.*, d.name as departmentName, u.name as creatorName,
             GROUP_CONCAT(DISTINCT t.id) as tagIds,
             GROUP_CONCAT(DISTINCT t.name) as tagNames,
             GROUP_CONCAT(DISTINCT t.color) as tagColors
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      LEFT JOIN users u ON r.createdBy = u.id
      LEFT JOIN record_tags rt ON r.id = rt.recordId
      LEFT JOIN tags t ON rt.tagId = t.id
      WHERE 1=1
    `;
    
    let params = [];
    let conditions = [];
    
    // Get user info for access control
    const [userInfo] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    const user = userInfo[0];
    
    console.log('User info:', { id: user.id, isAdmin: user.isAdmin, accessLevel: user.accessLevel, departmentId: user.departmentId });
    
    // Access control based on user permissions
    if (!user.isAdmin) {
      if (user.accessLevel < 3) {
        // Basic users can only see their department's public/department records
        conditions.push(`(
          r.accessLevel IN ('PUBLIC', 'DEPARTMENT') AND r.departmentId = ?
          OR JSON_CONTAINS(IFNULL(r.allowedUsers, '[]'), ?, '$')
          OR r.createdBy = ?
        )`);
        params.push(user.departmentId, `"${user.id}"`, user.id);
      } else {
        // Managers can see more but not confidential unless specifically allowed
        conditions.push(`(
          r.accessLevel != 'CONFIDENTIAL'
          OR JSON_CONTAINS(IFNULL(r.allowedUsers, '[]'), ?, '$')
          OR r.createdBy = ?
        )`);
        params.push(`"${user.id}"`, user.id);
      }
    }
    
    // Apply filters
    if (department && department !== 'all' && department !== '') {
      console.log('Filtering by department:', department);
      conditions.push('d.name = ?');
      params.push(department);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      console.log('Filtering by search term:', searchTerm);
      conditions.push(`(
        r.title LIKE ? OR 
        r.textRecord LIKE ? OR 
        r.outline LIKE ? OR
        r.remark LIKE ? OR
        u.name LIKE ?
      )`);
      const searchPattern = `%${searchTerm.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (tags && tags.length > 0) {
      console.log('Filtering by tags:', tags);
      const tagList = Array.isArray(tags) ? tags : [tags];
      const validTags = tagList.filter(tag => tag && tag.trim() !== '');
      if (validTags.length > 0) {
        const tagPlaceholders = validTags.map(() => '?').join(',');
        conditions.push(`t.id IN (${tagPlaceholders})`);
        params.push(...validTags);
      }
    }
    
    if (financialPeriod && financialPeriod !== '') {
      console.log('Filtering by financial period:', financialPeriod);
      conditions.push('r.financialPeriodId = ?');
      params.push(financialPeriod);
    }
    
    if (dateFrom && dateFrom !== '') {
      console.log('Filtering by date from:', dateFrom);
      conditions.push('r.date >= ?');
      params.push(dateFrom);
    }
    
    if (dateTo && dateTo !== '') {
      console.log('Filtering by date to:', dateTo);
      conditions.push('r.date <= ?');
      params.push(dateTo);
    }
    
    if (createdBy && createdBy !== '') {
      console.log('Filtering by creator:', createdBy);
      conditions.push('r.createdBy = ?');
      params.push(createdBy);
    }
    
    if (accessLevel && accessLevel !== '') {
      console.log('Filtering by access level:', accessLevel);
      conditions.push('r.accessLevel = ?');
      params.push(accessLevel);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY r.id ORDER BY r.date DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    
    console.log('Final query:', query);
    console.log('Query params:', params);
    
    const [results] = await db.query(query, params);
    
    console.log('Query results count:', results.length);
    
    // Process results to include tags
    const processedResults = results.map(record => ({
      ...record,
      department: record.departmentName,
      tags: record.tagIds ? record.tagIds.split(',').map((id, index) => ({
        id,
        name: record.tagNames.split(',')[index],
        color: record.tagColors.split(',')[index]
      })) : []
    }));
    
    // Log the view activity
    await logActivity(req.user.userId, 'VIEW_RECORDS', 'Viewed records list with filters');
    
    res.json(processedResults);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

// Get record changes
exports.getRecordChanges = async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Check if user can view this record
    const { hasAccess } = await checkRecordAccess(req.user.userId, recordId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [changes] = await db.query(`
      SELECT rc.*, u.name as changedByName
      FROM record_changes rc
      LEFT JOIN users u ON rc.changedBy = u.id
      WHERE rc.recordId = ?
      ORDER BY rc.createdAt DESC
    `, [recordId]);
    
    res.json(changes);
  } catch (error) {
    console.error('Error fetching record changes:', error);
    res.status(500).json({ error: 'Failed to fetch record changes' });
  }
};

// Log record changes
const logRecordChange = async (recordId, userId, changeType, fieldChanged = null, oldValue = null, newValue = null, description = null) => {
  try {
    await db.query(
      'INSERT INTO record_changes (recordId, changedBy, changeType, fieldChanged, oldValue, newValue, changeDescription) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [recordId, userId, changeType, fieldChanged, oldValue, newValue, description]
    );
  } catch (error) {
    console.error('Error logging record change:', error);
  }
};

// Get record by ID with enhanced access control
exports.getRecordById = async (req, res) => {
  try {
    const { hasAccess, record } = await checkRecordAccess(req.user.userId, req.params.id, 'read');
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Get record with tags
    const [results] = await db.query(`
      SELECT r.*, d.name as departmentName,
             GROUP_CONCAT(DISTINCT t.id) as tagIds,
             GROUP_CONCAT(DISTINCT t.name) as tagNames,
             GROUP_CONCAT(DISTINCT t.color) as tagColors
      FROM records r
      LEFT JOIN departments d ON r.departmentId = d.id
      LEFT JOIN record_tags rt ON r.id = rt.recordId
      LEFT JOIN tags t ON rt.tagId = t.id
      WHERE r.id = ?
      GROUP BY r.id
    `, [req.params.id]);
    
    const recordWithTags = {
      ...results[0],
      department: results[0].departmentName,
      tags: results[0].tagIds ? results[0].tagIds.split(',').map((id, index) => ({
        id,
        name: results[0].tagNames.split(',')[index],
        color: results[0].tagColors.split(',')[index]
      })) : []
    };
    
    // Log the view activity
    await logActivity(
      req.user.userId, 
      'VIEW_RECORD',
      `Viewed record: ${recordWithTags.title}`,
      req.params.id
    );
    
    res.json(recordWithTags);
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

module.exports.getRecordChanges = exports.getRecordChanges;
