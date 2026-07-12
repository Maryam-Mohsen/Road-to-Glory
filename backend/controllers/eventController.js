const Event = require('../models/Event');

const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, location, date, capacity } = req.body;

    if (!title || !description || !category || !location || !date || !capacity) {
      return res.status(400).json({ message: 'All event fields are required.' });
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
    if (status && status !== 'all') filter.status = status;
    else if (!status) filter.status = { $in: ['upcoming', 'ongoing'] };

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
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (!canEditEvent(req.user, event)) {
      return res.status(403).json({ message: 'You cannot manage this event.' });
    }

    const { title, description, category, location, date, capacity, status } = req.body;
    if (capacity && capacity < event.reservedCount) {
      return res.status(400).json({ message: 'Capacity cannot be lower than current reservations.' });
    }

    Object.assign(event, {
      title: title ?? event.title,
      description: description ?? event.description,
      category: category ?? event.category,
      location: location ?? event.location,
      date: date ?? event.date,
      capacity: capacity ?? event.capacity,
      status: status ?? event.status,
    });

    await event.save();
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (!canDeleteEvent(req.user, event)) {
      return res.status(403).json({ message: 'You cannot manage this event.' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
