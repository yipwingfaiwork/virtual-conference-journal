
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
};

module.exports = pool;
module.exports.testConnection = testConnection;
