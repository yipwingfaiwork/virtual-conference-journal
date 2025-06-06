const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const certPath = path.join(__dirname, '..', '..', 'certs', 'DigiCertGlobalRootCA.crt.pem');
console.log('Resolved SSL cert path:', certPath);
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
  }
});

module.exports = pool;