const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['panic', 'medical', 'theft', 'other'],
    default: 'panic'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'dispatched', 'resolved'],
    default: 'active'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  message: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', AlertSchema);
