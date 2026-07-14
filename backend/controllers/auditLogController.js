const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };