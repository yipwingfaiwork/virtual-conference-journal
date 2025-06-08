const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

router.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, password, phone, address, departmentId, isAdmin, isActive, createdAt, updatedAt FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Login successful for:', email);
    res.json({
      token: 'relaxhotelkey' /* 替換為實際 JWT 生成邏輯 */,
      user: {
        id: user.id,
        name: user.name || 'Admin User',
        email: user.email,
        phone: user.phone || '123-456-7890',
        address: user.address || '123 Admin St',
        departmentId: user.departmentId || 1,
        isAdmin: user.isAdmin || 0,
        isActive: user.isActive || 1,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;