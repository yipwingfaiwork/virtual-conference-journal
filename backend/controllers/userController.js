
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { logActivity } = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Only admin can get all users
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [users] = await query(`
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
    const userId = req.params.id;
    
    // Users can only access their own data unless they're admin
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [users] = await query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId,
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { name, email, phone, address, departmentId, isAdmin, isActive, password } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email already exists
    const [existingUsers] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Hash password (use default password if not provided)
    const defaultPassword = password || 'pw1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Insert user
    const [result] = await query(
      'INSERT INTO users (name, email, phone, address, departmentId, password, isAdmin, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || '', address || '', departmentId || 1, hashedPassword, !!isAdmin, isActive !== false]
    );
    
    // Log user creation activity
    await logActivity(req.user.userId, 'CREATE_USER', `Created new user: ${name}`);
    
    // Return created user (without password)
    const [newUser] = await query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId,
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, departmentId, isAdmin, isActive } = req.body;
    
    // Users can only update their own data unless they're admin
    // Admin users can update any user
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if user exists
    const [users] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    const updateQuery = req.user.isAdmin 
      ? 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, departmentId = ?, isAdmin = ?, isActive = ? WHERE id = ?'
      : 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, departmentId = ? WHERE id = ?';
    
    const updateParams = req.user.isAdmin 
      ? [name, email, phone, address, departmentId, !!isAdmin, isActive !== false, userId]
      : [name, email, phone, address, departmentId, userId];
    
    await query(updateQuery, updateParams);
    
    // Log user update activity
    await logActivity(req.user.userId, 'UPDATE_USER', `Updated user profile: ${name}`);
    
    // Get updated user
    const [updatedUsers] = await query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId,
        u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [userId]);
    
    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const userId = req.params.id;
    
    // Check if user exists
    const [users] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting the last admin user
    if (users[0].isAdmin) {
      const [adminCount] = await query('SELECT COUNT(*) as count FROM users WHERE isAdmin = 1');
      if (adminCount[0].count <= 1) {
        return res.status(409).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user
    await query('DELETE FROM users WHERE id = ?', [userId]);
    
    // Log user deletion activity
    await logActivity(req.user.userId, 'DELETE_USER', `Deleted user: ${users[0].name}`);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    
    // Validate user id from token matches requested id
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get user with password
    const [users] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify old password (skip for admin changing other user's password)
    if (req.user.userId == userId) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    // Log password change
    await logActivity(req.user.userId, 'CHANGE_PASSWORD', `Changed password for user: ${user.name}`);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password', details: error.message });
  }
};
