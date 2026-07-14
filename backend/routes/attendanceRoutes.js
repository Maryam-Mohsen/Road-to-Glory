const express = require('express');
const { validateTicket, getEventAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', protect, authorize('organizer', 'admin'), validateTicket);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventAttendance);

module.exports = router;