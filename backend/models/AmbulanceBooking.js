const mongoose = require('mongoose');

const AmbulanceBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  hospital: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['Normal', 'High', 'Critical'],
    default: 'Normal'
  },
  ambulanceType: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'Cash'
  },
  trackingToken: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Dispatched', 'En Route', 'Arrived', 'At Hospital', 'Completed', 'Cancelled'],
    default: 'Dispatched'
  },
  statusTimeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  eta: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AmbulanceBooking', AmbulanceBookingSchema);
