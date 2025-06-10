
const pool = require('../config/db');

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const [tags] = await pool.execute('SELECT * FROM tags ORDER BY name');
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

// Get tag by ID
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const [tags] = await pool.execute('SELECT * FROM tags WHERE id = ?', [id]);
    
    if (tags.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(tags[0]);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
};

// Create new tag
exports.createTag = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, color, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO tags (name, color, description) VALUES (?, ?, ?)',
      [name, color || '#3B82F6', description || null]
    );
    
    const [tags] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(tags[0]);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { name, color, description } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE tags SET name = ?, color = ?, description = ? WHERE id = ?',
      [name, color, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    const [tags] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [id]
    );
    
    res.json(tags[0]);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

// Delete tag
exports.deleteTag = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM tags WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};
