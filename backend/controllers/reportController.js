const Event = require('../models/Event');
const Reservation = require('../models/Reservation');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const User = require('../models/User');


const getPlatformOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalReservations, totalAttendance] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Reservation.countDocuments({ status: 'confirmed' }),
      Attendance.countDocuments(),
    ]);

    const mostPopularEvents = await Event.find()
      .sort({ reservedCount: -1 })
      .limit(5)
      .select('title reservedCount capacity category');

    res.json({
      totalUsers,
      totalEvents,
      totalReservations,
      totalAttendance,
      mostPopularEvents,
    });
  } catch (err) {
    next(err);
  }
};

const getEventReport = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const [reservationCount, feedbackStats] = await Promise.all([
      Reservation.countDocuments({ event: eventId, status: 'confirmed' }),
      Feedback.aggregate([
        { $match: { event: event._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    // Check-in flow isn't wired up yet (Attendance controller/routes are disabled),
    // so every confirmed reservation is treated as checked-in for now.
    const attendanceCount = reservationCount;
    const attendanceRate = event.capacity > 0 ? (attendanceCount / event.capacity) * 100 : 0;

    res.json({
      event: { id: event._id, title: event.title, capacity: event.capacity },
      reservationCount,
      attendanceCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      averageRating: feedbackStats[0]?.avgRating ? Math.round(feedbackStats[0].avgRating * 10) / 10 : null,
      totalReviews: feedbackStats[0]?.totalReviews || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlatformOverview, getEventReport };