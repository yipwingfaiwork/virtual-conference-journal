
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const recordRoutes = require('./records');
const userRoutes = require('./users');
const activityLogRoutes = require('./activity-logs');
const tagRoutes = require('./tags');
const financialPeriodRoutes = require('./financial-periods');

// Mount routes
router.use('/auth', authRoutes);
router.use('/records', recordRoutes);
router.use('/users', userRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/tags', tagRoutes);
router.use('/financial-periods', financialPeriodRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
