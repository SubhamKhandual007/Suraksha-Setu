import { tokenManager } from './api';
import { API_BASE_URL } from '../config';

export interface QRVerificationData {
  digitalId: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  status: 'SAFE' | 'EMERGENCY';
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  registrationTimestamp: string;
  lastVerified: string;
  verificationMethod: string;
}

export interface AlertData {
  message: string;
  timestamp: string;
  type: string;
}

export interface VerificationResult {
  success: boolean;
  tourist?: QRVerificationData;
  alert?: AlertData;
  message?: string;
  errorCode?: string;
}

class VerificationService {
  /**
   * Generate QR code data for a digital ID
   */
  async generateQRCode(digitalId: string): Promise<{ success: boolean; qrData?: string; message?: string }> {
    try {
      const token = tokenManager.getToken();
      
      // Try authenticated endpoint first if we have a token
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/verify/generate-qr/${digitalId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (data.success) {
            return data;
          }
        } catch (error) {
          console.log('Authenticated QR generation failed, trying public endpoint...');
        }
      }

      // Fallback to public endpoint (no authentication required)
      const response = await fetch(`${API_BASE_URL}/api/verify/qr-public/${digitalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('QR generation error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Verify a digital ID (quick verification)
   */
  async verifyDigitalId(digitalId: string): Promise<VerificationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify/${digitalId}`);
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Verification error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Verify QR code data
   */
  async verifyQRCode(qrData: string): Promise<VerificationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('QR verification error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Bulk verify multiple digital IDs
   */
  async bulkVerify(digitalIds: string[]): Promise<{
    success: boolean;
    summary?: { total: number; valid: number; invalid: number };
    results?: Array<VerificationResult & { digitalId: string }>;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ digitalIds }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Bulk verification error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Format QR data for sharing
   */
  formatQRDataForSharing(digitalId: string, qrData: string): string {
    return `🛡️ Suraksha Setu Digital Tourist ID Verification

📱 Tourist ID: ${digitalId}
🔐 Secure QR Data: ${qrData.substring(0, 100)}...

📋 How to Verify:
1. Copy the QR data above
2. Paste in Suraksha Setu verification app
3. Get instant tourist verification

⚠️ This QR code expires in 24 hours for security

🌐 Verify online: ${API_BASE_URL}/api/verify/${digitalId}`;
  }

  /**
   * Validate digital ID format
   */
  validateDigitalIdFormat(digitalId: string): boolean {
    // Check if it matches TID + timestamp + random format
    const tidPattern = /^TID\d{13}\d+$/;
    return tidPattern.test(digitalId) && digitalId.length >= 16;
  }

  /**
   * Get verification history (if implemented in backend)
   */
  async getVerificationHistory(): Promise<{
    success: boolean;
    history?: Array<{
      digitalId: string;
      timestamp: string;
      method: string;
      success: boolean;
    }>;
    message?: string;
  }> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }

      // This endpoint would need to be implemented in backend
      const response = await fetch(`${API_BASE_URL}/api/verify/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('History fetch error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }
}

export const verificationService = new VerificationService();
export default verificationService;
