const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;
  try {
    console.log('Attempting to connect to database...');
    console.log('SSL cert path:', '/home/site/wwwroot/certs/DigiCertGlobalRootCA.crt.pem');
    const caCert = require('fs').readFileSync('/home/site/wwwroot/certs/DigiCertGlobalRootCA.crt.pem');
    console.log('SSL cert loaded successfully');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: {
        ca: caCert,
        rejectUnauthorized: true
      }
    });
    console.log('Connection established, testing query...');
    await connection.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Test connection error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { testConnection };