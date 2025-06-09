
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tagController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/tags - Get all tags
router.get('/', getAllTags);

// GET /api/tags/:id - Get tag by ID
router.get('/:id', getTagById);

// POST /api/tags - Create new tag (admin only)
router.post('/', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, createTag);

// PUT /api/tags/:id - Update tag (admin only)
router.put('/:id', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, updateTag);

// DELETE /api/tags/:id - Delete tag (admin only)
router.delete('/:id', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, deleteTag);

module.exports = router;
