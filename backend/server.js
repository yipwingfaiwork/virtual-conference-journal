
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./config/db');
const setupMiddleware = require('./middleware');

require('dotenv').config({ path: './.env' });

const app = express();

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Database connection test function
async function testConnection() {
  let connection;
  try {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PORT:', process.env.DB_PORT);
    
    connection = await pool.getConnection();
    console.log('✓ Database connection successful');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✓ Database query test successful:', rows);
    
    return true;
  } catch (err) {
    console.error('Database connection test failed:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    return false;
  } finally {
    if (connection) connection.release();
  }
}

async function startServer() {
  try {
    console.log('Starting Relax Hotel Conference Record System API Server...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Environment check - DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
    console.log('Environment check - DB_NAME:', process.env.DB_NAME ? 'SET' : 'NOT SET');
    console.log('Environment check - JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }
    console.log('✓ Database connection successful');

    // Setup middleware
    setupMiddleware(app);
    
    // Setup routes
    app.use('/api', routes);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });
    
    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Relax Hotel Conference Record System API',
        version: '1.0.0',
        documentation: '/api',
        health: '/health'
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      console.log('404 - Route not found:', req.method, req.originalUrl);
      res.status(404).json({ 
        error: 'Route not found',
        method: req.method,
        path: req.originalUrl,
        message: 'The requested endpoint does not exist'
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Global error handler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
      });
      
      res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    const port = process.env.PORT || 5001;
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base URL: http://localhost:${port}/api`);
      console.log(`✓ Health Check: http://localhost:${port}/health`);
      console.log('✓ Server startup completed successfully');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Server startup error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    process.exit(1);
  }
}

startServer();
