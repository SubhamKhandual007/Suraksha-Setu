const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Government', 'Private', 'BLS', 'ALS', 'Air'],
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'En Route', 'Busy', 'Out of Service'],
    default: 'Available'
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Base Station'
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Ambulance', AmbulanceSchema);
