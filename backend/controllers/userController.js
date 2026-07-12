const User = require('../models/User');
const Event = require('../models/Event');

const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    req.user.name = name ?? req.user.name;
    req.user.phone = phone ?? req.user.phone;
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, organizerStatus } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (organizerStatus) filter.organizerStatus = organizerStatus;

    const users = await User.find(filter).select('-password');
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const reviewOrganizer = async (req, res, next) => {
  try {
    const { decision } = req.body; 
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be approved or rejected.' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'organizer') {
      return res.status(404).json({ message: 'Organizer request not found.' });
    }

    user.organizerStatus = decision;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};


const setUserActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be deactivated.' });
    }

    user.isActive = !!isActive;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

const deleteOrganizer = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found.' });

    if (target.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizer accounts can be deleted.' });
    }

    await Event.deleteMany({ organizer: target._id });
    await target.deleteOne();

    res.json({ message: 'Organizer account and their events were deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateMe, getAllUsers, reviewOrganizer, setUserActive, deleteOrganizer };
