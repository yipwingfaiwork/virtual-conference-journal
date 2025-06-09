
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Get user with department info
    const [users] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId,
        u.password, u.isAdmin, u.isActive, u.createdAt, u.updatedAt,
        d.name as departmentName
      FROM users u
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE u.email = ?
    `, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        isAdmin: user.isAdmin,
        departmentId: user.departmentId 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Log login activity
    await logActivity(user.id, 'LOGIN', `User logged in: ${user.email}`);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user (me endpoint)
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [users] = await db.query(`
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
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Log logout activity
    await logActivity(req.user.userId, 'LOGOUT', `User logged out: ${req.user.email}`);
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
