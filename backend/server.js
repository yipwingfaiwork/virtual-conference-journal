
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
//const { testConnection } = require('./test-db');
const { testConnection } = require('./config/db');
const setupMiddleware = require('./middleware');

const app = express();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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

  setupMiddleware(app);
  app.use('/', routes);

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
