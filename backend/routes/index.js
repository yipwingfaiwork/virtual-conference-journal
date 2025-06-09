
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const recordRoutes = require('./records');
const departmentRoutes = require('./departments');
const tagRoutes = require('./tags');
const financialPeriodRoutes = require('./financial-periods');
const activityLogRoutes = require('./activity-logs');

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/departments', departmentRoutes);
router.use('/tags', tagRoutes);
router.use('/financial-periods', financialPeriodRoutes);
router.use('/activity-logs', activityLogRoutes);

module.exports = router;
