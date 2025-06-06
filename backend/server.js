const express = require('express');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');
const app = express();
require('dotenv').config(); // 加載 .env 檔案
const { testConnection } = require('./test-db'); // 假設 testConnection 在 test-db.js 中
const PORT = process.env.PORT || 5001; // 預設端口

setupMiddleware(app);
setupRoutes(app);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason.stack);
  process.exit(1);
});

const startServer = async () => {
  console.log('Starting server...');
  console.log('Environment variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PORT: process.env.DB_PORT,
    PORT: process.env.PORT
  });
  // 強制刷新日誌
  console.log('Flushing logs...');
  process.stdout.write('', () => { console.log('Logs flushed'); });

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