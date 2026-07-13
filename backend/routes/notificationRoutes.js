const express = require('express');
const { getMyNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMyNotifications);

module.exports = router;