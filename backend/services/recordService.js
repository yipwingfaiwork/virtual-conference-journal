
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
    
    if (userInfo.isManager) {
      // Managers can view all records (PUBLIC, DEPARTMENT, CONFIDENTIAL)
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
      conditions.push(`(r.title LIKE ? OR r.MeetingFullRecord LIKE ? OR r.MeetingOutline LIKE ?)`);
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
  static processRecordResults(rows) {
    return rows.map(row => {
      let tags = [];
      let participants = [];
      
      // Safely parse tags
      try {
        if (row.tags) {
          if (typeof row.tags === 'string') {
            // Try to parse as JSON string
            tags = JSON.parse(row.tags);
          } else if (Array.isArray(row.tags)) {
            // Already an array
            tags = row.tags;
          }
          // Filter out null values
          tags = tags.filter(tag => tag !== null);
        }
      } catch (e) {
        console.warn(`Invalid JSON in tags for record ${row.id}: ${row.tags}, using empty array`);
        tags = [];
      }
      
      // Safely parse participants
      try {
        if (row.participants) {
          if (typeof row.participants === 'string') {
            participants = JSON.parse(row.participants);
          } else if (Array.isArray(row.participants)) {
            participants = row.participants;
          }
        }
      } catch (e) {
        console.warn(`Invalid JSON in participants for record ${row.id}: ${row.participants}, using empty array`);
        participants = [];
      }
      
      return {
        ...row,
        tags,
        participants,
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
    
    const [rows] = await pool.query(checkQuery, [recordId, userId, isAdmin]);
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
