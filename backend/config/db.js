
const mysql = require('mysql2/promise');

// Database connection configuration for Azure MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false // Azure MySQL Flexible Server with require_secure_transport: OFF
  },
  connectionLimit: 10,
  charset: 'utf8mb4',
  multipleStatements: false,
  namedPlaceholders: true
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
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
    console.log('✓ Database connection successful');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✓ Database query test successful:', rows);
    
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

// Export pool as default and testConnection as named export
module.exports = pool;
module.exports.testConnection = testConnection;
