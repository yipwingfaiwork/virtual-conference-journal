
/**
 * THIS IS A DOCUMENTATION FILE ONLY - NOT FOR USE IN THE FRONTEND
 * 
 * This file demonstrates how you would set up a MySQL connection
 * on your Node.js backend server.
 */

// Using MySQL2 for better promises support
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_database',
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: 10, // Adjust based on your needs
};

// Create a pool for managing connections
const pool = mysql.createPool(dbConfig);

// Example function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
}

// Example query function
async function queryDatabase(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Example of how to use these functions in an API endpoint
// This would typically be in your Express.js routes file
/*
app.get('/api/records', async (req, res) => {
  try {
    const records = await queryDatabase('SELECT * FROM records WHERE status = ?', ['active']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});
*/

module.exports = {
  pool,
  testConnection,
  queryDatabase
};
