
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Import sub-route modules
const recordRoutes = require('./records');
const userRoutes = require('./users');
const tagRoutes = require('./tags');
const departmentRoutes = require('./departments');
const activityLogRoutes = require('./activity-logs');
const authRoutes = require('./auth');
const financialPeriodRoutes = require('./financial-periods');

router.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes (no authentication required)
router.use('/api/auth', authRoutes);

// Protected routes (authentication required)
router.use('/api/records', recordRoutes);
router.use('/api/users', userRoutes);
router.use('/api/tags', tagRoutes);
router.use('/api/departments', departmentRoutes);
router.use('/api/activity-logs', activityLogRoutes);
router.use('/api/financial-periods', financialPeriodRoutes);

module.exports = router;
