
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      ORDER BY u.name
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, departmentId, isAdmin } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, phone, address, departmentId, isAdmin) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone || null, address || null, departmentId || null, isAdmin || false]
    );
    
    // Get created user
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [result.insertId]);
    
    res.status(201).json(users[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, departmentId, isAdmin, isActive, password } = req.body;
    
    // Check if user exists
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let updateQuery = `
      UPDATE users SET 
        name = ?, email = ?, phone = ?, address = ?, 
        departmentId = ?, isAdmin = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
    `;
    let params = [name, email, phone, address, departmentId, isAdmin, isActive];
    
    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await pool.execute(updateQuery, params);
    
    // Get updated user
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [id]);
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
