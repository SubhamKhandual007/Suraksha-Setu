const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import database connection and routes
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verification');
const SocketHandler = require('./socket/socketHandler');
const paymentRoutes = require('./routes/payment');
const ambulanceRoutes = require('./routes/ambulance');
const { auth } = require('./middleware/auth');
const User = require('./models/User');
const Alert = require('./models/Alert');
const jwt = require('jsonwebtoken');
const activityService = require('./services/activityService');
const incidentRoutes = require('./routes/incidents');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO
const socketHandler = new SocketHandler(server);

// Connect to database
connectDB();

// Middleware - Configure helmet to allow Socket.IO CDN
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://www.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://api.stripe.com",
        process.env.WS_URL || "ws://localhost:5000",
        process.env.WSS_URL || "wss://localhost:5000",
        process.env.API_BASE_URL || "http://localhost:5000"
      ],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for monitoring dashboard)
app.use(express.static(require('path').join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Tourist Safety System API',
    version: '1.0.0',
    status: 'running'
  });
});

// Debug middleware to log ALL requests starting with /api
app.use('/api', (req, res, next) => {
  console.log(`Incoming API Request: ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);

// Direct Google Login Route in server.js to ensure it's found
app.post('/api/auth/google-login', async (req, res) => {
  console.log('Direct Google Login hit!', req.body);
  try {
    const { email, name, role = 'admin' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        role: role || 'admin',
        isActive: true,
        phone: 'Google User',
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        digitalId: user.digitalId
      }
    });
  } catch (error) {
    console.error('Direct Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.use('/api', verificationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/incidents', incidentRoutes);

// Socket.IO stats endpoint
app.get('/api/socket/stats', (req, res) => {
  res.json(socketHandler.getStats());
});

// Alert statistics endpoint — reads from DB for accuracy
app.get('/api/alerts/stats', async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const activeAlerts = await Alert.countDocuments({ status: { $in: ['active', 'acknowledged', 'dispatched'] } });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });
    const lastAlertDoc = await Alert.findOne().sort({ createdAt: -1 }).populate('tourist', 'name digitalId');
    const lastAlert = lastAlertDoc ? {
      alertId: lastAlertDoc._id.toString(),
      digitalId: lastAlertDoc.tourist?.digitalId || 'Unknown',
      type: lastAlertDoc.type,
      timestamp: lastAlertDoc.createdAt,
      status: lastAlertDoc.status
    } : null;
    res.json({
      success: true,
      stats: { totalAlerts, activeAlerts, resolvedAlerts, lastAlert }
    });
  } catch (err) {
    console.error('Error fetching alert stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Get all emergency alerts (for admin) — merges in-memory socket alerts + DB alerts
app.get('/api/alerts/emergency', async (req, res) => {
  try {
    // In-memory socket alerts (from socket.io events, may not be authenticated)
    const socketAlerts = socketHandler.getEmergencyAlerts() || [];

    // DB alerts (from authenticated REST API calls — authoritative source)
    const dbAlerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('tourist', 'name digitalId email phone');

    // Convert DB alerts to same shape as socket alerts
    const dbAlertsMapped = dbAlerts.map(a => ({
      alertId: a._id.toString(),
      _id: a._id.toString(),
      userId: a.tourist?._id?.toString() || '',
      digitalId: a.tourist?.digitalId || 'Unknown',
      userName: a.tourist?.name || 'Unknown Tourist',
      type: 'EMERGENCY',
      emergencyType: a.type,
      location: {
        latitude: a.location?.coordinates?.[1] || 0,
        longitude: a.location?.coordinates?.[0] || 0,
      },
      timestamp: a.createdAt,
      status: a.status === 'active' ? 'ACTIVE' :
              a.status === 'resolved' ? 'RESOLVED' : a.status.toUpperCase(),
      message: a.message || `${a.type} emergency alert`,
      resolvedAt: a.resolvedAt || null,
      source: 'db'
    }));

    // Socket alerts that aren't already in DB (dedup by alertId)
    const dbIds = new Set(dbAlertsMapped.map(a => a.alertId));
    const socketOnlyAlerts = socketAlerts.filter(a => !dbIds.has(a.alertId));

    // Merge: DB alerts first (authoritative), then any socket-only alerts
    const merged = [...dbAlertsMapped, ...socketOnlyAlerts]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      alerts: merged
    });
  } catch (err) {
    console.error('Error fetching emergency alerts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

// Resolve an alert (for admin) — updates DB + in-memory
app.post('/api/alerts/:alertId/resolve', auth, async (req, res) => {
  const { alertId } = req.params;
  try {
    // Try to resolve in DB first (for REST API-sourced alerts)
    let dbResolved = false;
    try {
      const dbAlert = await Alert.findByIdAndUpdate(
        alertId,
        { status: 'resolved', resolvedAt: new Date() },
        { new: true }
      );
      if (dbAlert) dbResolved = true;
    } catch (dbErr) {
      // alertId may not be a valid ObjectId (socket-only alert), that's fine
    }

    // Also resolve in-memory socket alert (for socket-only alerts)
    const socketResolved = socketHandler.resolveAlert(alertId);

    if (dbResolved || socketResolved) {
      res.json({ success: true, message: 'Alert resolved successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Alert not found' });
    }
  } catch (err) {
    console.error('Error resolving alert:', err);
    res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
});

// Get recent activities (for admin)
app.get('/api/admin/activities', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const activities = await activityService.getRecent(10);
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    socketStats: socketHandler.getStats()
  });
});

// Safe API Routes
app.post('/api/location/update', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      lastLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
        timestamp: new Date()
      }
    });
    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
});

app.post('/api/emergency/alert', auth, async (req, res) => {
  try {
    const { type, location, message } = req.body;
    const alert = await Alert.create({
      tourist: req.user._id,
      type: type || 'panic',
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      message
    });
    
    // Log Activity
    await activityService.log({
      userId: req.user._id,
      digitalId: req.user.digitalId,
      userName: req.user.name,
      type: 'SOS_ALERT',
      action: `Emergency SOS Alert: ${type || 'panic'}`,
      details: { location, message, alertId: alert._id },
      status: 'CRITICAL'
    });

    // Broadcast to admins via socket
    socketHandler.broadcastToAdmins('emergency_alert', {
      alertId: alert._id,
      userId: req.user._id,
      digitalId: req.user.digitalId,
      userName: req.user.name,
      type: 'EMERGENCY',
      emergencyType: type || 'panic',
      location,
      timestamp: alert.createdAt,
      status: 'ACTIVE',
      message: message || 'Emergency alert triggered'
    });

    res.status(201).json({ success: true, alertId: alert._id });
  } catch (err) {
    console.error('Error triggering alert:', err);
    res.status(500).json({ success: false, message: 'Failed to trigger alert' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
  console.log(`📱 Smart Tourist Safety System API`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time connections`);
});

module.exports = app;
