
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logActivity } = require('../utils/logger');
const JWT_SECRET = process.env.JWT_SECRET || 'relax-hotel-secret-key';

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from database with department info
    const [users] = await db.query(`
      SELECT 
        u.*, d.name as departmentName 
      FROM users u 
      LEFT JOIN departments d ON u.departmentId = d.id 
      WHERE u.email = ?
    `, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Remove password from user object
    const { password: userPassword, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log login activity
    await logActivity(user.id, 'LOGIN', 'User logged in successfully');
    
    res.json({ 
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Logout controller
exports.logout = async (req, res) => {
  try {
    // Log logout activity
    if (req.user && req.user.userId) {
      await logActivity(req.user.userId, 'LOGOUT', 'User logged out successfully');
    }
    
    // In a stateless JWT implementation, the client just removes the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed', details: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get fresh user data from database
    const [users] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.departmentId, u.isAdmin,
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
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
};
