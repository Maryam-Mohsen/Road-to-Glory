const express = require('express');
const { getPlatformOverview, getEventReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, authorize('admin'), getPlatformOverview);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventReport);

module.exports = router;
