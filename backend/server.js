
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
