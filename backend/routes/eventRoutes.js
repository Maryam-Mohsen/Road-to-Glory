const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize, requireApprovedOrganizer } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post(
  '/',
  protect,
  authorize('organizer'),
  requireApprovedOrganizer,
  createEvent
);
router.put('/:id', protect, authorize('organizer'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
