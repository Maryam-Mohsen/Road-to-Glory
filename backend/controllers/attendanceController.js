const Reservation = require('../models/Reservation');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

const validateTicket = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;
    if (!ticketCode) return res.status(400).json({ message: 'ticketCode is required.' });

    const reservation = await Reservation.findOne({ ticketCode }).populate('event');
    if (!reservation || reservation.status !== 'confirmed') {
      return res.status(404).json({ message: 'Invalid or cancelled ticket.' });
    }

    const event = reservation.event;

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot validate tickets for this event.' });
    }

    const alreadyCheckedIn = await Attendance.findOne({ reservation: reservation._id });
    if (alreadyCheckedIn) {
      return res.status(409).json({ message: 'This ticket has already been used.' });
    }

    const attendance = await Attendance.create({
      reservation: reservation._id,
      event: event._id,
      user: reservation.user,
      checkedInBy: req.user._id,
    });

    res.status(201).json({ message: 'Ticket validated. Attendee checked in.', attendance });
  } catch (err) {
    next(err);
  }
};

const getEventAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ event: req.params.eventId }).populate('user', 'name email');
    res.json({ attendance: records });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateTicket, getEventAttendance };