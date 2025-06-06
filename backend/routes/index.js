const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const recordRoutes = require('./records');
const userRoutes = require('./users');
const activityLogRoutes = require('./activity-logs');
const tagRoutes = require('./tags');
const financialPeriodRoutes = require('./financial-periods');
const departmentRoutes = require('./departments');

// Define setupRoutes function
const setupRoutes = (app) => {
  // Mount routes under /api
  app.use('/api', router);

  // Mount sub-routes
  router.use('/auth', authRoutes);
  router.use('/records', recordRoutes);
  router.use('/users', userRoutes);
  router.use('/activity-logs', activityLogRoutes);
  router.use('/tags', tagRoutes);
  router.use('/financial-periods', financialPeriodRoutes);
  router.use('/departments', departmentRoutes);

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
};

module.exports = setupRoutes;

/* AI generate backup 06062025 start//
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const recordRoutes = require('./records');
const userRoutes = require('./users');
const activityLogRoutes = require('./activity-logs');
const tagRoutes = require('./tags');
const financialPeriodRoutes = require('./financial-periods');
const departmentRoutes = require('./departments');

// Mount routes
router.use('/auth', authRoutes);
router.use('/records', recordRoutes);
router.use('/users', userRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/tags', tagRoutes);
router.use('/financial-periods', financialPeriodRoutes);
router.use('/departments', departmentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
*/ //AI generate backup 06062025 end