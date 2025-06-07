const express = require('express');
const cors = require('cors');
const setupRoutes = require('./routes');
const { testConnection } = require('./test-db');

const app = express();

async function startServer() {
  console.log('Starting server...');
  console.log('Environment variables:', process.env);
  console.log('Testing database connection...');
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  console.log('Database connection successful');

  app.use(cors({
    origin: [
      'https://lemon-moss-03941a703.6.azurestaticapps.net',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
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