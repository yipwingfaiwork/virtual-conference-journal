const express = require('express');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Import middleware and routes setup
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Apply middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Start the server with database connection check
const startServer = async () => {
  console.log('Starting server...');
  console.log('Environment variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PORT: process.env.DB_PORT,
    PORT: process.env.PORT
  });
  try {
    console.log('Testing database connection...');
    const connectionResult = await testConnection();
    if (!connectionResult) {
      throw new Error('Database connection failed');
    }
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    process.exit(1);
  }
};

startServer();



//const express = require('express');
//const dotenv = require('dotenv');

// Load environment variables
//dotenv.config();

// Import middleware and routes setup
//const setupMiddleware = require('./middleware');
//const setupRoutes = require('./routes');

//const app = express();
//const PORT = process.env.PORT || 5001;

// Apply middleware
//setupMiddleware(app);

// Setup routes
//setupRoutes(app);

// Start the server
//app.listen(PORT, () => {
//  console.log(`Server running on port ${PORT}`);
//});
