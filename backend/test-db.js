const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const certPath = path.join(__dirname, 'certs', 'DigiCertGlobalRootCA.crt.pem');
console.log('Resolved SSL cert path in db.js:', certPath);
let caCert;
try {
  caCert = fs.readFileSync(certPath);
  console.log('SSL cert loaded successfully in db.js, length:', caCert.length);
} catch (error) {
  console.error('Failed to load SSL cert in db.js:', {
    message: error.message,
    stack: error.stack,
    code: error.code
  });
  throw error;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
    secureProtocol: 'TLSv1_2_method'
  },
  connectionLimit: 10
});

pool.getConnection((err, conn) => {
  if (err) console.error('Pool connection error:', err);
  else console.log('Pool connection successful');
  if (conn) conn.release();
});

module.exports = pool;

/*const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
    const certPath = path.join(__dirname, 'certs', 'DigiCertGlobalRootCA.crt.pem');
    console.log('Checking SSL cert path:', certPath);
    const caCert = fs.readFileSync(certPath);
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
        secureProtocol: 'TLSv1_2_method'
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
*/