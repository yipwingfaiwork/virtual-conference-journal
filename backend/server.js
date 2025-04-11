
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

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'my_database',
  port: Number(process.env.DB_PORT) || 8889,
  connectionLimit: 10,
};

// Create a pool for managing connections
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Auth API endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo purposes - in production you would check against database
    // Hardcoded demo users
    const demoUsers = [
      {
        id: "1",
        email: "admin@example.com",
        password: "admin123", // In production, this would be hashed
        name: "Admin User",
        phone: "123-456-7890",
        address: "123 Admin St",
        department: "Management",
        accessLevel: 3,
        isAdmin: true
      },
      {
        id: "2",
        email: "user@example.com",
        password: "user123", // In production, this would be hashed
        name: "Regular User",
        phone: "098-765-4321",
        address: "456 User Ave",
        department: "Operations",
        accessLevel: 1,
        isAdmin: false
      }
    ];
    
    const user = demoUsers.find(u => u.email === email);
    
    if (!user || user.password !== password) {
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
    
    res.json({ 
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a stateless JWT implementation, the client just removes the token
  // Server-side we don't need to do anything for simple implementations
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  // The user info comes from the decoded token in the authenticateToken middleware
  res.json(req.user);
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
    
    // Find the user based on decoded token
    // For demo purposes - in production you would fetch from database
    const demoUsers = [
      {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
        phone: "123-456-7890",
        address: "123 Admin St",
        department: "Management",
        accessLevel: 3,
        isAdmin: true
      },
      {
        id: "2",
        email: "user@example.com",
        name: "Regular User",
        phone: "098-765-4321",
        address: "456 User Ave",
        department: "Operations",
        accessLevel: 1,
        isAdmin: false
      }
    ];
    
    const user = demoUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  });
}

// Records API endpoints
app.get('/api/records', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM records');
    res.json(results);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.get('/api/records/:id', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM records WHERE id = ?', [req.params.id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error(`Error fetching record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const { date, duration, department, title, participants, videoLink, textRecord, outline, createdBy } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO records (date, duration, department, title, participants, videoLink, textRecord, outline, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [date, duration, department, title, JSON.stringify(participants), videoLink, textRecord, outline, createdBy]
    );
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

app.put('/api/records/:id', async (req, res) => {
  try {
    const { date, duration, department, title, participants, videoLink, textRecord, outline } = req.body;
    
    await pool.query(
      'UPDATE records SET date = ?, duration = ?, department = ?, title = ?, participants = ?, videoLink = ?, textRecord = ?, outline = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [date, duration, department, title, JSON.stringify(participants), videoLink, textRecord, outline, req.params.id]
    );
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error(`Error updating record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(`Error deleting record ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
