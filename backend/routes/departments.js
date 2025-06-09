
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/departments - Get all departments
router.get('/', getAllDepartments);

// GET /api/departments/:id - Get department by ID
router.get('/:id', getDepartmentById);

// POST /api/departments - Create new department (admin only)
router.post('/', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, createDepartment);

// PUT /api/departments/:id - Update department (admin only)
router.put('/:id', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, updateDepartment);

// DELETE /api/departments/:id - Delete department (admin only)
router.delete('/:id', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, deleteDepartment);

module.exports = router;
