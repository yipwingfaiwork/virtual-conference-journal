const express = require('express');
const cors = require('cors');
const setupRoutes = require('./routes');
const { testConnection } = require('./test-db');
require('dotenv').config();

const app = express();

async function startServer() {
  console.log('Starting server...');
  console.log('Environment variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PORT: process.env.DB_PORT,
    PORT: process.env.PORT
  });

  console.log('Flushing logs...');
  console.log('Testing database connection...');
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  console.log('Database connection successful');

  console.log('Logs flushed');

  app.use(cors({ credentials: true, origin: true }));
  app.use(express.json());

  setupRoutes(app);

  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup error:', {
    message: error.message,
    stack: error.stack,
    code: error.code
  });
  process.exit(1);
});