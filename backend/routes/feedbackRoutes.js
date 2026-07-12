const express = require('express');
const { submitFeedback, getEventFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('attendee'), submitFeedback);
router.get('/event/:eventId', protect, getEventFeedback);

module.exports = router;
