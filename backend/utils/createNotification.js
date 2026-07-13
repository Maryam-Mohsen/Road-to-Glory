const Notification = require('../models/Notification');

const createNotification = async (userId, title, message) => {
  await Notification.create({
    user: userId,
    title,
    message,
  });
};

module.exports = createNotification;