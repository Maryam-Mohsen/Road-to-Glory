const express = require('express');
const {
  updateMe,
  getAllUsers,
  reviewOrganizer,
  setUserActive,
  deleteOrganizer,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.put('/me', protect, updateMe);

// Admin
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/review-organizer', protect, authorize('admin'), reviewOrganizer);
router.put('/:id/status', protect, authorize('admin'), setUserActive);
router.delete('/:id', protect, authorize('admin'), deleteOrganizer);

module.exports = router;
