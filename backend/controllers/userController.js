
const pool = require('../config/db');
const bcrypt = require('bcrypt'); // 使用 bcrypt 而不是 bcryptjs

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.TelegramId, u.isAdmin, u.isManager, u.isActive, u.createdAt, u.updatedAt,
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
    
    const [users] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.TelegramId, u.isAdmin, u.isManager, u.isActive, u.createdAt, u.updatedAt,
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
    const { name, email, password, phone, address, departmentId, TelegramId, isAdmin, isManager, isActive } = req.body;
    
    console.log('Create user request body:', req.body);
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Validate password
    if (password.trim() === '') {
      return res.status(400).json({ error: 'Password cannot be empty' });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    // Create user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, phone, address, departmentId, TelegramId, isAdmin, isManager, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone || null, address || null, departmentId || null, TelegramId || null, isAdmin || false, isManager || false, isActive !== false]
    );
    
    // Get created user
    const [users] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.TelegramId, u.isAdmin, u.isManager, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.id = ?
    `, [result.insertId]);
    
    console.log('User created successfully:', users[0].email);
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
    const { name, email, phone, address, departmentId, TelegramId, isAdmin, isManager, isActive, password } = req.body;
    
    // Check if user exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let updateQuery = `
      UPDATE users SET 
        name = ?, email = ?, phone = ?, address = ?, 
        departmentId = ?, TelegramId = ?, isAdmin = ?, isManager = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
    `;
    let params = [name, email, phone, address, departmentId, TelegramId, isAdmin, isManager, isActive];
    
    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(updateQuery, params);
    
    // Get updated user
    const [users] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, 
        u.TelegramId, u.isAdmin, u.isManager, u.isActive, u.createdAt, u.updatedAt,
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
    const requestingUserId = req.user.id; // From auth middleware
    const requestingUserIsAdmin = req.user.isAdmin; // From auth middleware
    
    // Check if requesting user is admin
    if (!requestingUserIsAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    // Prevent admin from deleting themselves
    if (requestingUserId === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if target user exists
    const [existingUsers] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user (foreign keys will be set to NULL automatically)
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    console.log(`Admin ${requestingUserId} deleted user ${existingUsers[0].email} (ID: ${id})`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Check for specific constraint errors
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'Cannot delete user due to existing references. Please run the database migration first.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    // Get user's current password
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
