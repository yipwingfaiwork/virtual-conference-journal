const app = express();
const PORT = process.env.PORT; // 僅使用 Azure 分配的端口

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