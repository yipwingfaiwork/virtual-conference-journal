const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;
  try {
    console.log('Attempting to connect to database...');
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PORT: process.env.DB_PORT
    });
    if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
      throw new Error('Missing required environment variables');
    }
    const caCertPath = '/home/site/wwwroot/certs/DigiCertGlobalRootCA.crt.pem';
    console.log('Checking SSL cert path:', caCertPath);
    const caCert = require('fs').readFileSync(caCertPath);
    console.log('SSL cert loaded successfully, length:', caCert.length);
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: {
        ca: caCert,
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
        secureProtocol: 'TLSv1_2_method' // 明確指定 TLS 協議
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