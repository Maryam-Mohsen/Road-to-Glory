const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'organizer_approved',
        'organizer_rejected',
        'user_activated',
        'user_deactivated',
        'organizer_deleted',
        'event_approved',
        'event_rejected',
        'event_deleted',
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['User', 'Event'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);