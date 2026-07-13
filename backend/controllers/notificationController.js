const Notification = require('../models/Notification');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
};