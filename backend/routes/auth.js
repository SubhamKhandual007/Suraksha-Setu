const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const User = require('../models/User');
const { auth, adminOnly, invalidateUserCache } = require('../middleware/auth');
const verificationService = require('../services/verificationService');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'tour-safe-6ce22',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('emergencyContact').custom((value, { req }) => {
    if (req.body.role === 'admin') return true;
    if (!value || value.trim().length < 10) {
      throw new Error('Emergency contact must be at least 10 characters for tourists');
    }
    return true;
  }),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, emergencyContact, role = 'tourist' } = req.body;

    // Check for existing user — use lean + select only _id for speed
    const existingUser = await User.findOne({ email }).select('_id').lean();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const userFields = {
      name,
      email,
      password,
      phone,
      role: role || 'tourist'
    };

    if (emergencyContact) {
      userFields.emergencyContacts = [{
        name: 'Primary Contact',
        phone: emergencyContact,
        relation: 'Primary'
      }];
    }

    const user = new User(userFields);

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emergencyContact: user.emergencyContact,
        role: user.role,
        digitalId: user.digitalId,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email — only select fields we need for login check
    const user = await User.findOne({ email }).select('+password name email phone emergencyContacts role digitalId isActive createdAt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emergencyContacts: user.emergencyContacts,
      role: user.role,
      digitalId: user.digitalId,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/firebase-login
// @desc    Login with Firebase (Google provider)
// @access  Public
router.post('/firebase-login', async (req, res) => {
  try {
    const { token, role = 'admin' } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Firebase token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email, picture, uid: firebaseUid } = decodedToken;

    // Find or create user — use lean for read, only fetch if exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists (Auto-register Firebase users as requested role)
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'), // Random password for Firebase users
        role: role || 'admin',
        isActive: true,
        firebaseUid
      });
      await user.save();
    } else {
      // Update firebaseUid if not present
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
        invalidateUserCache(user._id.toString());
      }
      
      // Ensure role matches for admin portal if specified
      if (role === 'admin' && user.role !== 'admin') {
         return res.status(403).json({ 
           success: false, 
           message: 'This account is not authorized as an Admin' 
         });
      }
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Firebase login successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        digitalId: user.digitalId,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Firebase token'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});


// @route   GET /api/auth/verify/:digitalId
// @desc    Verify a user by digitalId (Public)
// @access  Public
router.get('/verify/:digitalId', async (req, res) => {
  try {
    const { digitalId } = req.params;
    const result = await verificationService.quickVerify(digitalId);

    if (result.isValid) {
      const response = {
        success: true,
        tourist: result.userData
      };

      if (result.alertData) {
        response.alert = result.alertData;
      }

      res.json(response);
    } else {
      res.status(404).json({
        success: false,
        message: result.error || 'Tourist profile not found',
        errorCode: result.errorCode || 'NOT_FOUND'
      });
    }

  } catch (error) {
    console.error('ID verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during ID verification'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset token
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });
    invalidateUserCache(user._id.toString());

    // In a real app, you would send an email here. 
    // Since we don't have an email server, we'll return the token in the response for demo/development.
    res.json({
      success: true,
      message: 'Password reset token generated (Check console/response for development)',
      resetToken: resetToken // ONLY FOR DEVELOPMENT
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during forgot password'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    // Hash token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    invalidateUserCache(user._id.toString());

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

module.exports = router;
