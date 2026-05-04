const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for system activities
  },
  digitalId: {
    type: String,
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['SOS_ALERT', 'DIGITAL_ID_CHECK', 'LOGIN', 'REGISTER', 'SYSTEM'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS'],
    default: 'INFO'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
