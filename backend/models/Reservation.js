const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Prevent duplicate reservations: one active reservation per user per event
reservationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Reservation', reservationSchema);
