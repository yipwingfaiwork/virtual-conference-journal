
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Only admin can get all users
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [users] = await db.query(
      'SELECT id, name, email, phone, address, department, accessLevel, isAdmin FROM users'
    );
    
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
    
    const [users] = await db.query(
      'SELECT id, name, email, phone, address, department, accessLevel, isAdmin FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, department } = req.body;
    
    // Users can only update their own data unless they're admin
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    await db.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, department = ? WHERE id = ?',
      [name, email, phone, address, department, userId]
    );
    
    // Log user update activity
    await logActivity(req.user.userId, 'UPDATE_USER', `Updated user profile: ${name}`);
    
    // Get updated user
    const [updatedUsers] = await db.query(
      'SELECT id, name, email, phone, address, department, accessLevel, isAdmin FROM users WHERE id = ?', 
      [userId]
    );
    
    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
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
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    // Log password change
    await logActivity(req.user.userId, 'CHANGE_PASSWORD', 'Changed account password');
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password', details: error.message });
  }
};
