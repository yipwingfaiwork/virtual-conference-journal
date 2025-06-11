
const pool = require('../../config/db');
const RecordService = require('../../services/recordService');

// Get all records with enhanced filtering and access control
const getAllRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userInfo = req.user;
    
    console.log('User info:', userInfo);
    console.log('Query params:', req.query);
    
    let baseQuery = RecordService.buildBaseQuery();
    
    const allConditions = [];
    const allParams = [];
    
    // Add access control conditions
    const { conditions: accessConditions, params: accessParams } = 
      RecordService.buildAccessConditions(userInfo, userId);
    allConditions.push(...accessConditions);
    allParams.push(...accessParams);
    
    // Add filter conditions
    const { conditions: filterConditions, params: filterParams } = 
      RecordService.buildFilterConditions(req.query);
    allConditions.push(...filterConditions);
    allParams.push(...filterParams);
    
    // Add WHERE clause if there are conditions
    if (allConditions.length > 0) {
      baseQuery += ` WHERE ${allConditions.join(' AND ')}`;
    }
    
    // Group by and order
    baseQuery += ` GROUP BY r.id ORDER BY r.date DESC`;
    
    console.log('Final query:', baseQuery);
    console.log('Query params:', allParams);
    
    const [rows] = await pool.query(baseQuery, allParams);
    
    // Process the results
    const processedRows = RecordService.processRecordResults(rows);
    
    // Apply tag filter after processing
    const filteredRows = RecordService.applyTagFilters(processedRows, req.query.tags);
    
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
    const userId = req.user.userId;
    const userInfo = req.user;
    
    let query = RecordService.buildBaseQuery();
    query += ` WHERE r.id = ?`;
    
    const params = [id];
    
    // Add access control for single record
    if (!userInfo.isAdmin) {
      query += ` AND (
        r.isPublic = true OR 
        (r.isPublic = false AND r.isConfidential = false AND r.departmentId = ?) OR
        r.createdBy = ?
      )`;
      params.push(userInfo.departmentId, userId);
    }
    
    query += ` GROUP BY r.id`;
    
    const [rows] = await pool.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }
    
    const processedRecords = RecordService.processRecordResults(rows);
    res.json(processedRecords[0]);
    
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: 'Failed to fetch record', details: error.message });
  }
};

module.exports = {
  getAllRecords,
  getRecordById
};
