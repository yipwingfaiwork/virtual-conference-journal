
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret Key - should be in env var in production
const JWT_SECRET = process.env.JWT_SECRET || 'relax-hotel-secret-key';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'relax_hotel_system',
  port: Number(process.env.DB_PORT) || 8889, // MAMP default MySQL port
  connectionLimit: 10,
};

// Create a pool for managing connections
const pool = mysql.createPool(dbConfig);

// Function to log user activity
async function logActivity(userId, action, details = null, recordId = null) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (userId, action, details, recordId) VALUES (?, ?, ?, ?)',
      [userId, action, details, recordId]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Auth API endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
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
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
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
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get fresh user data from database
    const [users] = await pool.query(
      'SELECT id, name, email, phone, address, department, accessLevel, isAdmin FROM users WHERE id = ?', 
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  });
}

// Users API endpoints
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Only admin can get all users
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [users] = await pool.query(
      'SELECT id, name, email, phone, address, department, accessLevel, isAdmin FROM users'
    );
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Users can only access their own data unless they're admin
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [users] = await pool.query(
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
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, department } = req.body;
    
    // Users can only update their own data unless they're admin
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, department = ? WHERE id = ?',
      [name, email, phone, address, department, userId]
    );
    
    // Log user update activity
    await logActivity(req.user.userId, 'UPDATE_USER', `Updated user profile: ${name}`);
    
    // Get updated user
    const [updatedUsers] = await pool.query(
      'SELECT id, name, email, phone, address, department, accessLevel, isAdmin FROM users WHERE id = ?', 
      [userId]
    );
    
    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

app.post('/api/users/:id/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    
    // Validate user id from token matches requested id
    if (req.user.userId != userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get user with password
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
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
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    // Log password change
    await logActivity(req.user.userId, 'CHANGE_PASSWORD', 'Changed account password');
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password', details: error.message });
  }
});

// Records API endpoints
app.get('/api/records', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    
    let query = 'SELECT * FROM records';
    let params = [];
    
    if (department && department !== 'all') {
      query += ' WHERE department = ?';
      params.push(department);
    }
    
    const [results] = await pool.query(query, params);
    
    // Log the view activity for general records view
    await logActivity(req.user.userId, 'VIEW_RECORDS', 'Viewed records list');
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.get('/api/records/:id', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM records WHERE id = ?', [req.params.id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Log the view activity for specific record
    await logActivity(
      req.user.userId, 
      'VIEW_RECORD',
      `Viewed record: ${results[0].title}`,
      req.params.id
    );
    
    res.json(results[0]);
  } catch (error) {
    console.error(`Error fetching record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

app.post('/api/records', authenticateToken, async (req, res) => {
  try {
    const { date, duration, department, title, participants, videoLink, textRecord, outline } = req.body;
    const createdBy = req.user.userId;
    
    const [result] = await pool.query(
      'INSERT INTO records (date, duration, department, title, participants, videoLink, textRecord, outline, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [date, duration, department, title, JSON.stringify(participants), videoLink, textRecord, outline, createdBy]
    );
    
    // Log record creation
    await logActivity(
      createdBy, 
      'CREATE_RECORD', 
      `Created new record: ${title}`,
      result.insertId
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      date, 
      duration, 
      department, 
      title, 
      participants, 
      videoLink, 
      textRecord, 
      outline, 
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

app.put('/api/records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const { date, duration, department, title, participants, videoLink, textRecord, outline } = req.body;
    
    // Check if record exists
    const [records] = await pool.query('SELECT * FROM records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const record = records[0];
    
    // Check if user has permission to update this record
    if (record.createdBy != req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to update this record' });
    }
    
    await pool.query(
      'UPDATE records SET date = ?, duration = ?, department = ?, title = ?, participants = ?, videoLink = ?, textRecord = ?, outline = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [date, duration, department, title, JSON.stringify(participants), videoLink, textRecord, outline, recordId]
    );
    
    // Log record update
    await logActivity(
      req.user.userId, 
      'UPDATE_RECORD', 
      `Updated record: ${title}`,
      recordId
    );
    
    res.json({ 
      id: recordId, 
      date, 
      duration, 
      department, 
      title, 
      participants, 
      videoLink, 
      textRecord, 
      outline,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

app.delete('/api/records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Check if record exists
    const [records] = await pool.query('SELECT * FROM records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Only admins can delete records
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to delete records' });
    }
    
    const recordTitle = records[0].title;
    
    // Delete activity logs associated with this record first to maintain referential integrity
    await pool.query('DELETE FROM activity_logs WHERE recordId = ?', [recordId]);
    
    // Now delete the record
    await pool.query('DELETE FROM records WHERE id = ?', [recordId]);
    
    // Log record deletion (note: recordId is null since it's deleted)
    await logActivity(
      req.user.userId, 
      'DELETE_RECORD', 
      `Deleted record: ${recordTitle}`
    );
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(`Error deleting record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Activity Logs API endpoints (admin only)
app.get('/api/activity-logs', authenticateToken, async (req, res) => {
  try {
    // Only admins can access activity logs
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get query parameters for filtering
    const { userId, action, recordId, limit } = req.query;
    
    let query = `
      SELECT al.*, u.name as userName 
      FROM activity_logs al
      LEFT JOIN users u ON al.userId = u.id
    `;
    let params = [];
    let conditions = [];
    
    if (userId) {
      conditions.push('al.userId = ?');
      params.push(userId);
    }
    
    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }
    
    if (recordId) {
      conditions.push('al.recordId = ?');
      params.push(recordId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY al.timestamp DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(Number(limit));
    }
    
    const [logs] = await pool.query(query, params);
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
