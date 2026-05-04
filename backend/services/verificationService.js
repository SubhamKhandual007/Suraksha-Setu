const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Alert = require('../models/Alert');
const activityService = require('./activityService');

class VerificationService {
  /**
   * Generate QR code data for digital ID verification
   */
  generateQRCodeData(user) {
    const timestamp = Date.now();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const qrData = {
      digitalId: user.digitalId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      issuedAt: timestamp,
      expiresAt: timestamp + (24 * 60 * 60 * 1000), // Valid for 24 hours
      
      // Security feature: HMAC Signature for authenticity
      signature: this.generateSignature(user.digitalId, timestamp, secret)
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate digital signature for authenticity using HMAC-SHA256
   */
  generateSignature(digitalId, timestamp, secret) {
    const data = `${digitalId}-${timestamp}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Generate JWT token for secure verification
   */
  generateVerificationToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    return jwt.sign(
      {
        id: user._id || user.id,
        digitalId: user.digitalId,
        type: 'verification'
      },
      secret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify QR code data authenticity
   */
  async verifyQRCode(qrCodeString) {
    try {
      const qrData = JSON.parse(qrCodeString);
      
      // Check expiration
      if (Date.now() > qrData.expiresAt) {
        return {
          isValid: false,
          error: 'QR Code has expired',
          errorCode: 'EXPIRED'
        };
      }

      // Verify signature
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET not configured');

      const expectedSignature = this.generateSignature(qrData.digitalId, qrData.issuedAt, secret);
      if (qrData.signature !== expectedSignature) {
        return {
          isValid: false,
          error: 'Access Denied: Invalid digital signature',
          errorCode: 'INVALID_SIGNATURE'
        };
      }

      // Get latest user data from database
      const user = await User.findOne({ digitalId: qrData.digitalId });
      if (!user || !user.isActive) {
        return {
          isValid: false,
          error: 'Digital ID not found or inactive',
          errorCode: 'NOT_FOUND'
        };
      }

      // Check for active alerts for this user
      const activeAlert = await Alert.findOne({ 
        tourist: user._id || user.id,
        status: { $in: ['active', 'acknowledged', 'dispatched'] }
      }).sort({ createdAt: -1 });

      // Return verification result
      const result = {
        isValid: true,
        userData: {
          digitalId: user.digitalId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emergencyContact: user.emergencyContacts && user.emergencyContacts.length > 0 
            ? user.emergencyContacts[0].phone 
            : 'N/A',
          status: activeAlert ? 'EMERGENCY' : 'SAFE',
          location: {
            latitude: user.lastLocation?.coordinates?.[1] || 0,
            longitude: user.lastLocation?.coordinates?.[0] || 0,
            city: user.lastLocation?.city || 'Unknown'
          },
          registrationTimestamp: user.createdAt,
          lastVerified: new Date(),
          verificationMethod: 'QR_CODE'
        },
        qrCodeData: qrData
      };

      if (activeAlert) {
        result.alertData = {
          message: activeAlert.message || `Active ${activeAlert.type} alert`,
          timestamp: activeAlert.createdAt,
          type: activeAlert.type
        };
      }

      return result;

    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR Code format',
        errorCode: 'INVALID_FORMAT'
      };
    }
  }

  /**
   * Quick verification by Digital ID only
   */
  async quickVerify(digitalId) {
    try {
      const user = await User.findOne({ 
        digitalId: digitalId,
        isActive: true 
      });

      if (!user) {
        return {
          isValid: false,
          error: 'Digital ID not found',
          errorCode: 'NOT_FOUND'
        };
      }

      // Check for active alerts for this user
      const activeAlert = await Alert.findOne({ 
        tourist: user._id || user.id,
        status: { $in: ['active', 'acknowledged', 'dispatched'] }
      }).sort({ createdAt: -1 });

      const result = {
        isValid: true,
        userData: {
          digitalId: user.digitalId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emergencyContact: user.emergencyContacts && user.emergencyContacts.length > 0 
            ? user.emergencyContacts[0].phone 
            : 'N/A',
          status: activeAlert ? 'EMERGENCY' : 'SAFE',
          location: {
            latitude: user.lastLocation?.coordinates?.[1] || 0,
            longitude: user.lastLocation?.coordinates?.[0] || 0,
            city: user.lastLocation?.city || 'Unknown'
          },
          registrationTimestamp: user.createdAt,
          lastVerified: new Date(),
          verificationMethod: 'QUICK_LOOKUP'
        }
      };

      if (activeAlert) {
        result.alertData = {
          message: activeAlert.message || `Active ${activeAlert.type} alert`,
          timestamp: activeAlert.createdAt,
          type: activeAlert.type
        };
      }

      return result;
    } catch (error) {
      return {
        isValid: false,
        error: 'Verification failed',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Advanced verification with biometric data (future enhancement)
   */
  async biometricVerify(digitalId, biometricHash) {
    // Placeholder for future biometric verification
    // Could integrate with Aadhaar API or other biometric systems
    return {
      isValid: false,
      error: 'Biometric verification not implemented',
      errorCode: 'NOT_IMPLEMENTED'
    };
  }

  /**
   * Cross-verify with government databases (future enhancement)
   */
  async governmentVerify(digitalId, aadhaarNumber, passportNumber) {
    // Placeholder for government database integration
    // Could verify against Aadhaar, Passport databases
    return {
      isValid: false,
      error: 'Government verification not implemented',
      errorCode: 'NOT_IMPLEMENTED'
    };
  }

  /**
   * Log verification attempt for audit trail
   */
  async logVerification(digitalId, verificationMethod, result, verifierInfo) {
    console.log('Verification Log:', {
      digitalId,
      method: verificationMethod,
      success: result.isValid,
      timestamp: new Date(),
      verifier: verifierInfo
    });
    
    // Log to Activity database
    await activityService.log({
      digitalId: digitalId,
      userName: result.userData?.name || 'Unknown Tourist',
      type: 'DIGITAL_ID_CHECK',
      action: `Digital ID Verification: ${verificationMethod}`,
      details: { 
        success: result.isValid, 
        method: verificationMethod, 
        verifier: verifierInfo,
        error: result.error
      },
      status: result.isValid ? 'SUCCESS' : 'WARNING'
    });
  }
}

module.exports = new VerificationService();
