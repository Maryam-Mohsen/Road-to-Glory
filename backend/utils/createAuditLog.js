const AuditLog = require('../models/AuditLog');

const createAuditLog = async (adminId, action, targetType, targetId, details) => {
  await AuditLog.create({
    admin: adminId,
    action,
    targetType,
    targetId,
    details,
  });
};

module.exports = createAuditLog;