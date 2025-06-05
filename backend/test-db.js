const mysql = require('mysql2/promise');

async function testDbConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'hoteldb.mysql.database.azure.com',
    user: process.env.DB_USER || 'dba',
    password: process.env.DB_PASSWORD || 'Lezykgu1',
    database: process.env.DB_NAME || 'relax_hotel_system',
    port: Number(process.env.DB_PORT) || 3306,
    ssl: { rejectUnauthorized: true }
  });
  console.log('Connected to MySQL!');
  const [rows] = await connection.query('SELECT VERSION()');
  console.log('MySQL Version:', rows[0]['VERSION()']);
  await connection.end();
}

testDbConnection().catch(err => console.error('Connection error:', err));