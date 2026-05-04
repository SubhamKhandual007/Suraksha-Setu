const mongoose = require('mongoose');

const IncidentReportSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    unique: true
  },
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  touristName: { type: String, default: 'Anonymous' },
  touristDigitalId: { type: String, default: '' },
  reportType: {
    type: String,
    enum: [
      'tourist_in_danger',
      'theft_report',
      'harassment_report',
      'lost_tourist',
      'unsafe_area_alert',
      'medical_emergency',
      'suspicious_activity',
      'sos_alert',
      'other'
    ],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: 'Unknown Location' },
    city: { type: String, default: '' }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'responding', 'resolved', 'dismissed'],
    default: 'pending'
  },
  assignedTo: {
    type: String,
    default: ''
  },
  adminNotes: { type: String, default: '' },
  resolvedAt: { type: Date },
  markedAsZone: {
    type: Boolean,
    default: false
  },
  zoneType: {
    type: String,
    enum: ['', 'caution', 'high_risk'],
    default: ''
  },
  source: {
    type: String,
    enum: ['tourist_report', 'sos_alert', 'admin_created'],
    default: 'tourist_report'
  }
}, { timestamps: true });

// Auto-generate incidentId before save
IncidentReportSchema.pre('save', async function (next) {
  if (!this.incidentId) {
    try {
      // Find the document with the highest incidentId
      const lastIncident = await mongoose.model('IncidentReport').findOne({}, { incidentId: 1 }).sort({ createdAt: -1 });
      
      let nextNumber = 1;
      if (lastIncident && lastIncident.incidentId) {
        const lastNumber = parseInt(lastIncident.incidentId.replace('INC-', ''));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      
      this.incidentId = `INC-${String(nextNumber).padStart(5, '0')}`;
    } catch (err) {
      console.error('Error in incidentId pre-save hook:', err);
      // Fallback to timestamp if something goes wrong to ensure uniqueness
      this.incidentId = `INC-${Date.now().toString().slice(-5)}`;
    }
  }
  next();
});

module.exports = mongoose.model('IncidentReport', IncidentReportSchema);
