
const mysql = require('mysql2/promise');

// Simple database connection without SSL certificate
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates for Azure MySQL
  },
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test connection function
async function testConnection() {
  let connection;
  try {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PORT:', process.env.DB_PORT);
    
    connection = await pool.getConnection();
    console.log('Database connection test successful');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Database query test successful:', rows);
    
    return true;
  } catch (err) {
    console.error('Database connection test failed:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Export pool and testConnection
module.exports = { pool, testConnection };
