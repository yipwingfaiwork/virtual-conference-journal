
const pool = require('../config/db');

class TagService {
  // Handle tags when creating or updating records
  static async handleRecordTags(recordId, tags) {
    if (!tags) return;

    let parsedTags = [];
    try {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    } catch (e) {
      console.error('Error parsing tags:', e);
      return;
    }

    if (!Array.isArray(parsedTags) || parsedTags.length === 0) return;

    for (const tag of parsedTags) {
      let tagId = tag.id;
      
      // If tag doesn't have an ID, create it
      if (!tagId || tagId === '') {
        const [tagResult] = await pool.query(
          'INSERT INTO tags (name, color, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
          [tag.name, tag.color || '#3B82F6', tag.description || '']
        );
        tagId = tagResult.insertId;
      }
      
      // Link tag to record
      await pool.query(
        'INSERT IGNORE INTO record_tags (recordId, tagId) VALUES (?, ?)',
        [recordId, tagId]
      );
    }
  }

  // Remove all tags from a record
  static async removeRecordTags(recordId) {
    await pool.query('DELETE FROM record_tags WHERE recordId = ?', [recordId]);
  }
}

module.exports = TagService;
