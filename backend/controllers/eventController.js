const Event = require('../models/Event');
const Reservation = require('../models/Reservation');
const createNotification = require('../utils/createNotification');
const createAuditLog = require('../utils/createAuditLog');

const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, location, date, capacity } = req.body;

    if (!title || !description || !category || !location || !date || !capacity) {
      return res.status(400).json({ message: 'All event fields are required.' });
    }

    const eventDate = new Date(date);

if (isNaN(eventDate.getTime())) {
  return res.status(400).json({ message: 'Invalid event date.' });
}

if (eventDate <= new Date()) {
  return res.status(400).json({ message: 'Event date must be in the future.' });
}

const year = eventDate.getFullYear();

if (year < 2026 || year > 2100) {
  return res.status(400).json({ message: 'Please enter a valid event year.' });
}

if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1 || Number(capacity) > 10000) {
  return res.status(400).json({
    message: 'Capacity ?.'
  });
}
    const event = await Event.create({
      title,
      description,
      category,
      location,
      date,
      capacity,
      organizer: req.user._id,
    });

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status && status !== 'all') {
    filter.status = status;}
   else if (!status) {
    filter.status = 'approved';}

    const events = await Event.find(filter).populate('organizer', 'name').sort({ date: 1 });
    res.json({ events });
  } catch (err) {
    next(err);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

const canEditEvent = (user, event) => event.organizer.toString() === user._id.toString();

const canDeleteEvent = (user, event) =>
  user.role === 'admin' || event.organizer.toString() === user._id.toString();

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    const wasApproved = event.status === 'approved';

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canEditEvent(req.user, event)) {
      return res.status(403).json({ message: 'You cannot manage this event.' });
    }

    const { title, description, category, location, date, capacity, status } = req.body;

    if (capacity && capacity < event.reservedCount) {
      return res.status(400).json({
        message: 'Capacity cannot be lower than current reservations.',
      });
    }

    Object.assign(event, {
      title: title ?? event.title,
      description: description ?? event.description,
      category: category ?? event.category,
      location: location ?? event.location,
      date: date ?? event.date,
      capacity: capacity ?? event.capacity,
      status: req.user.role === 'organizer' ? 'pending' : (status ?? event.status),
    });

    await event.save();

    if (wasApproved) {
  const reservations = await Reservation.find({
    event: event._id,
    status: 'confirmed',
  });

  for (const reservation of reservations) {
    await createNotification(
      reservation.user,
      'Event Updated',
      `The event "${event.title}" has been updated and is waiting for admin approval.`
    );
  }
}

    res.json({ event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!canDeleteEvent(req.user, event)) {
      return res.status(403).json({ message: 'You cannot manage this event.' });
    }

    const reservations = await Reservation.find({
      event: event._id,
      status: 'confirmed',
    });

    for (const reservation of reservations) {
      await createNotification(
        reservation.user,
        'Event Deleted',
        `The event "${event.title}" has been deleted by the organizer.`
      );
    }
    
    await Reservation.deleteMany({ event: event._id });

    if (req.user.role === 'admin') {
      await createAuditLog(
        req.user._id,
        'event_deleted',
        'Event',
        event._id,
        `Event "${event.title}" was deleted by an admin.`
      );
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted.' });
  } catch (err) {
    next(err);
  }
};

const reviewEvent = async (req, res, next) => {
  try {
    const { decision } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({
        message: 'Decision must be approved or rejected.',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
      });
    }

    event.status = decision;
    await event.save();

    await createAuditLog(
      req.user._id,
      decision === 'approved' ? 'event_approved' : 'event_rejected',
      'Event',
      event._id,
      `Event "${event.title}" was ${decision}.`
    );

    res.json({ event });
  } catch (err) {
    next(err);
  }
};

const getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ events });
  } catch (err) {
    next(err);
  }
};

const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ events });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  reviewEvent,
  getPendingEvents,
  getMyEvents,
};