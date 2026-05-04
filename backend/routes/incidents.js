const express = require('express');
const router = express.Router();
const IncidentReport = require('../models/IncidentReport');
const Alert = require('../models/Alert');
const { auth } = require('../middleware/auth');
const activityService = require('../services/activityService');

// Middleware: admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// GET /api/incidents — Get all incident reports with filters
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { status, severity, reportType, search, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }
    if (severity) filter.severity = severity;
    if (reportType) filter.reportType = reportType;
    if (search) {
      filter.$or = [
        { touristName: { $regex: search, $options: 'i' } },
        { touristDigitalId: { $regex: search, $options: 'i' } },
        { incidentId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reports, total] = await Promise.all([
      IncidentReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('tourist', 'name email digitalId phone'),
      IncidentReport.countDocuments(filter)
    ]);
    res.json({ success: true, reports, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch incidents' });
  }
});

// GET /api/incidents/stats — Dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [total, active, resolved, critical, highAlertZones, byType] = await Promise.all([
      IncidentReport.countDocuments(),
      IncidentReport.countDocuments({ status: { $in: ['pending', 'responding'] } }),
      IncidentReport.countDocuments({ status: 'resolved' }),
      IncidentReport.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
      IncidentReport.countDocuments({ markedAsZone: true, zoneType: 'high_risk' }),
      IncidentReport.aggregate([
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    res.json({ success: true, stats: { total, active, resolved, critical, highAlertZones, byType } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/incidents/:id — Get single incident
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id)
      .populate('tourist', 'name email digitalId phone emergencyContacts');
    if (!report) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch incident' });
  }
});

// POST /api/incidents — Create new incident (admin or tourist)
router.post('/', auth, async (req, res) => {
  try {
    const { reportType, title, description, location, severity, touristName, touristDigitalId, source } = req.body;
    const report = new IncidentReport({
      tourist: req.user._id,
      touristName: touristName || req.user.name || 'Anonymous',
      touristDigitalId: touristDigitalId || req.user.digitalId || '',
      reportType,
      title,
      description,
      location,
      severity: severity || 'medium',
      source: source || 'tourist_report'
    });
    await report.save();
    await activityService.log({
      userId: req.user._id,
      digitalId: req.user.digitalId,
      userName: req.user.name,
      type: 'SOS_ALERT',
      action: `Incident Reported: ${title}`,
      details: { reportType, severity, location },
      status: severity === 'critical' ? 'CRITICAL' : 'WARNING'
    });
    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error('CRITICAL: Error creating incident report:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create incident',
      error: err.message
    });
  }
});

// PATCH /api/incidents/:id/status — Update status
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes, assignedTo } = req.body;
    const update = { status };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (assignedTo !== undefined) update.assignedTo = assignedTo;
    if (status === 'resolved') update.resolvedAt = new Date();
    const report = await IncidentReport.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// PATCH /api/incidents/:id/zone — Mark as safety zone
router.patch('/:id/zone', auth, adminOnly, async (req, res) => {
  try {
    const { zoneType } = req.body; // 'caution' | 'high_risk' | ''
    const report = await IncidentReport.findByIdAndUpdate(
      req.params.id,
      { markedAsZone: !!zoneType, zoneType: zoneType || '' },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark zone' });
  }
});

// POST /api/incidents/from-sos — Convert SOS alert to incident
router.post('/from-sos', auth, adminOnly, async (req, res) => {
  try {
    const { alertId, touristName, touristDigitalId, location, message } = req.body;
    const report = new IncidentReport({
      touristName: touristName || 'Unknown Tourist',
      touristDigitalId: touristDigitalId || '',
      reportType: 'sos_alert',
      title: 'SOS Emergency Alert',
      description: message || 'Tourist triggered SOS panic button',
      location: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        address: 'GPS Coordinates (see map)',
      },
      severity: 'critical',
      source: 'sos_alert'
    });
    await report.save();
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create incident from SOS' });
  }
});

module.exports = router;
