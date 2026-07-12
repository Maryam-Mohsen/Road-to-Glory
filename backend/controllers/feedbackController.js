const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');

const submitFeedback = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;
    if (!eventId || !rating) {
      return res.status(400).json({ message: 'eventId and rating are required.' });
    }

    const attended = await Attendance.findOne({ event: eventId, user: req.user._id });
    if (!attended) {
      return res.status(403).json({ message: 'You can only review events you attended.' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      event: eventId,
      rating,
      comment,
    });

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};

const getEventFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ event: req.params.eventId }).populate('user', 'name');
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitFeedback, getEventFeedback };
