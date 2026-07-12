const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Fan Zone',
        'Public Match Screening',
        'Volunteer Program',
        'Press Conference',
        'Community Activity',
        'Celebration Event',
      ],
      required: true,
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    reservedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);


eventSchema.virtual('availableSeats').get(function () {
  return Math.max(this.capacity - this.reservedCount, 0);
});
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
