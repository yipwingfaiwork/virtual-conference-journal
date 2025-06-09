
const { pool } = require('../config/db');

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    console.log('Fetching all tags...');
    const [rows] = await pool.execute('SELECT * FROM tags ORDER BY name');
    console.log('Tags fetched successfully:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tags',
      details: error.message 
    });
  }
};

// Get tag by ID
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching tag by ID:', id);
    
    const [rows] = await pool.execute('SELECT * FROM tags WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    console.log('Tag fetched successfully:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tag',
      details: error.message 
    });
  }
};

// Create new tag
exports.createTag = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    console.log('Creating new tag:', { name, color, description });
    
    const [result] = await pool.execute(
      'INSERT INTO tags (name, color, description) VALUES (?, ?, ?)',
      [name, color || '#3B82F6', description]
    );
    
    console.log('Tag created successfully with ID:', result.insertId);
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      color: color || '#3B82F6',
      description,
      message: 'Tag created successfully' 
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ 
      error: 'Failed to create tag',
      details: error.message 
    });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;
    console.log('Updating tag:', { id, name, color, description });
    
    const [result] = await pool.execute(
      'UPDATE tags SET name = ?, color = ?, description = ? WHERE id = ?',
      [name, color, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    console.log('Tag updated successfully');
    res.json({ 
      id, 
      name, 
      color,
      description,
      message: 'Tag updated successfully' 
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ 
      error: 'Failed to update tag',
      details: error.message 
    });
  }
};

// Delete tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting tag:', id);
    
    const [result] = await pool.execute('DELETE FROM tags WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    console.log('Tag deleted successfully');
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ 
      error: 'Failed to delete tag',
      details: error.message 
    });
  }
};
