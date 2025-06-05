const express = require('express');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

dotenv.config();

const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5001;

setupMiddleware(app);
setupRoutes(app);

const startServer = async () => {
  console.log('Starting server...');
  console.log('Environment variables:', process.env);
  try {
    console.log('Testing database connection...');
    const connectionResult = await testConnection();
    if (!connectionResult) throw new Error('Database connection failed');
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', {
      message: error.message,
      stackTrace: error.stack,
      errorCode: error.code
    });
    process.exit(1);
  }
};

startServer();