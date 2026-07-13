const express = require('express');
const {
  createEvent,
  getEvents,
  getPendingEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  reviewEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);

router.get(
  '/pending',
  protect,
  authorize('admin'),
  getPendingEvents
);

router.get(
  '/my-events',
  protect,
  authorize('organizer'),
  getMyEvents
);

router.get('/:id', getEventById);

router.post(
  '/',
  protect,
  authorize('organizer'),
  createEvent
);
router.put('/:id', protect, authorize('organizer'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

router.patch(
  '/:id/review',
  protect,
  authorize('admin'),
  reviewEvent
);

module.exports = router;
