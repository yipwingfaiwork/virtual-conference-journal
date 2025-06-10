
const pool = require('../config/db');

class RecordService {
  // Build the base query for records with all joins
  static buildBaseQuery() {
    return `
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
  }

  // Build access control conditions
  static buildAccessConditions(userInfo, userId) {
    if (userInfo.isAdmin) {
      return { conditions: [], params: [] };
    }
    
    const conditions = [`(
      r.isPublic = true OR 
      (r.isPublic = false AND r.isConfidential = false AND r.departmentId = ?) OR
      r.createdBy = ?
    )`];
    const params = [userInfo.departmentId, userId];
    
    return { conditions, params };
  }

  // Build search and filter conditions
  static buildFilterConditions(queryParams) {
    const conditions = [];
    const params = [];

    if (queryParams.searchTerm) {
      conditions.push(`(r.title LIKE ? OR r.textRecord LIKE ? OR r.outline LIKE ?)`);
      const searchPattern = `%${queryParams.searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (queryParams.department) {
      conditions.push(`r.departmentId = ?`);
      params.push(queryParams.department);
    }

    if (queryParams.financialPeriod) {
      conditions.push(`r.financialPeriodId = ?`);
      params.push(queryParams.financialPeriod);
    }

    if (queryParams.dateFrom) {
      conditions.push(`r.date >= ?`);
      params.push(queryParams.dateFrom);
    }

    if (queryParams.dateTo) {
      conditions.push(`r.date <= ?`);
      params.push(queryParams.dateTo);
    }

    if (queryParams.createdBy) {
      conditions.push(`r.createdBy = ?`);
      params.push(queryParams.createdBy);
    }

    return { conditions, params };
  }

  // Process record results to clean up and transform data
  /*static processRecordResults(rows) {
    return rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.filter(tag => tag !== null) : [],
      participants: row.participants ? JSON.parse(row.participants) : [],
      accessLevel: row.isPublic ? 'PUBLIC' : (row.isConfidential ? 'CONFIDENTIAL' : 'DEPARTMENT'),
      allowedDepartments: [],
      allowedUsers: []
    }));
  }*/
 static processRecordResults(rows) { //Fai ref Grok change 10-6-25
  return rows.map(row => {
    let tags = [];
    try {
      tags = row.tags ? JSON.parse(row.tags) : [];
    } catch (e) {
      console.warn(`Invalid JSON in tags for row ${row.id}: ${row.tags}, using empty array`);
      tags = [];
    }
    return {
      ...row,
      tags,
      participants: row.participants ? JSON.parse(row.participants) : [],
      accessLevel: row.isPublic ? 'PUBLIC' : (row.isConfidential ? 'CONFIDENTIAL' : 'DEPARTMENT'),
      allowedDepartments: [],
      allowedUsers: []
    };
  });
}

  // Apply tag filters after processing
  static applyTagFilters(records, tagFilters) {
    if (!tagFilters || !Array.isArray(tagFilters) || tagFilters.length === 0) {
      return records;
    }

    return records.filter(record => {
      const recordTagIds = record.tags.map(tag => tag.id.toString());
      return tagFilters.some(tagId => recordTagIds.includes(tagId.toString()));
    });
  }

  // Check if user has permission to modify a record
  static async checkModifyPermission(recordId, userId, isAdmin) {
    const checkQuery = `
      SELECT * FROM records 
      WHERE id = ? AND (createdBy = ? OR ? = true)
    `;
    
    const [rows] = await pool.execute(checkQuery, [recordId, userId, isAdmin]);
    return rows.length > 0;
  }

  // Map frontend accessLevel to database fields
  static mapAccessLevel(accessLevel) {
    return {
      isPublic: accessLevel === 'PUBLIC',
      isConfidential: accessLevel === 'CONFIDENTIAL'
    };
  }
}

module.exports = RecordService;
