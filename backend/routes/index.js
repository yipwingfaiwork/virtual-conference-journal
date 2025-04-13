
const authRoutes = require('./auth');
const userRoutes = require('./users');
const recordRoutes = require('./records');
const activityLogRoutes = require('./activity-logs');
const db = require('../config/db');

// Setup API routes
const setupRoutes = (app) => {
  // Test database connection endpoint
  app.get('/api/test-connection', async (req, res) => {
    try {
      const connected = await db.testConnection();
      if (connected) {
        res.json({ message: 'Database connection successful' });
      } else {
        res.status(500).json({ error: 'Database connection failed' });
      }
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
  });

  // Apply routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/activity-logs', activityLogRoutes);
};

module.exports = setupRoutes;
