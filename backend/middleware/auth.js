const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated. Token missing.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User no longer exists or is inactive.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You are not permitted to perform this action.' });
  }
  next();
};

const requireApprovedOrganizer = (req, res, next) => {
  if (req.user.role === 'organizer' && req.user.organizerStatus !== 'approved') {
    return res.status(403).json({ message: 'Your organizer account is not approved yet.' });
  }
  next();
};

module.exports = { protect, authorize, requireApprovedOrganizer };
