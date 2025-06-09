
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllFinancialPeriods,
  getFinancialPeriodById,
  createFinancialPeriod,
  updateFinancialPeriod,
  deleteFinancialPeriod
} = require('../controllers/financialPeriodController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/financial-periods - Get all financial periods
router.get('/', getAllFinancialPeriods);

// GET /api/financial-periods/:id - Get financial period by ID
router.get('/:id', getFinancialPeriodById);

// POST /api/financial-periods - Create new financial period (admin only)
router.post('/', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, createFinancialPeriod);

// PUT /api/financial-periods/:id - Update financial period (admin only)
router.put('/:id', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, updateFinancialPeriod);

// DELETE /api/financial-periods/:id - Delete financial period (admin only)
router.delete('/:id', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, deleteFinancialPeriod);

module.exports = router;
