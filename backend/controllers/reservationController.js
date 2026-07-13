const Reservation = require('../models/Reservation');
const Event = require('../models/Event');
const generateTicketCode = require('../utils/generateTicketCode');


const createReservation = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'eventId is required.' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'This event is not open for reservations.' });
    }

    const claimed = await Event.findOneAndUpdate(
  {
    _id: eventId,
    status: 'approved',
    $expr: { $lt: ['$reservedCount', '$capacity'] },
  },
  { $inc: { reservedCount: 1 } },
  { new: true }
);

    if (!claimed) {
      return res.status(409).json({ message: 'This event is fully booked.' });
    }

    let reservation;
    try {
      reservation = await Reservation.create({
        user: req.user._id,
        event: eventId,
        ticketCode: generateTicketCode(),
      });
    } catch (err) {
      await Event.findByIdAndUpdate(eventId, { $inc: { reservedCount: -1 } });
      if (err.code === 11000) {
        return res.status(409).json({ message: 'You already have a reservation for this event.' });
      }
      throw err;
    }

    res.status(201).json({ reservation });
  } catch (err) {
    next(err);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json({ reservations });
  } catch (err) {
    next(err);
  }
};

const getEventReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ reservations });
  } catch (err) {
    next(err);
  }
};

const cancelReservation = async (req, res, next) => {
  // console.log("cancelReservation called");
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

    const isOwner = reservation.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot cancel this reservation.' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled.' });
    }

    // await Reservation.findByIdAndDelete(reservation._id);
    const deleted = await Reservation.findByIdAndDelete(reservation._id);
// console.log(deleted);
    // console.log("Deleted:", reservation._id);

    // Free up the seat this reservation was holding
    await Event.findByIdAndUpdate(reservation.event, { $inc: { reservedCount: -1 } });

    res.json({ message: 'Reservation cancelled.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReservation, getMyReservations, getEventReservations, cancelReservation };
