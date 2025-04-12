
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticateToken } = require('../middleware/auth');

// Records routes
router.get('/', authenticateToken, recordController.getAllRecords);
router.get('/:id', authenticateToken, recordController.getRecordById);
router.post('/', authenticateToken, recordController.createRecord);
router.put('/:id', authenticateToken, recordController.updateRecord);
router.delete('/:id', authenticateToken, recordController.deleteRecord);

module.exports = router;
