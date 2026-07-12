const express = require('express');
const {
  createReservation,
  getMyReservations,
  getEventReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('attendee'), createReservation);
router.get('/my', protect, authorize('attendee'), getMyReservations);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventReservations);
router.delete('/:id', protect, cancelReservation);

module.exports = router;
