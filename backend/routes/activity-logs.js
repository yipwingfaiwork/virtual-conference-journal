
const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticateToken } = require('../middleware/auth');

// Activity logs routes
router.get('/', authenticateToken, activityLogController.getActivityLogs);

module.exports = router;
