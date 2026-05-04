export interface EmergencyContactData {
  name?: string;
  phone: string;
  relation?: string;
}

export interface EmergencyNotificationData {
  touristName: string;
  digitalId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  message: string;
  timestamp: Date;
}

class EmergencyContactService {
  /**
   * Send SMS to emergency contact using browser tel: protocol
   */
  async sendSMS(contact: EmergencyContactData, data: EmergencyNotificationData): Promise<boolean> {
    try {
      console.log('🔍 Starting SMS send process...');
      
      const locationText = `${data.location.latitude.toFixed(6)}, ${data.location.longitude.toFixed(6)}`;
      const googleMapsUrl = `https://maps.google.com/?q=${data.location.latitude},${data.location.longitude}`;
      
      const smsBody = `🚨 EMERGENCY ALERT 🚨\n\n` +
        `${data.touristName} (ID: ${data.digitalId}) needs help!\n\n` +
        `Message: ${data.message}\n\n` +
        `Location: ${locationText}\n` +
        `Map: ${googleMapsUrl}\n\n` +
        `Time: ${data.timestamp.toLocaleString()}\n\n` +
        `This is an automated emergency notification from Suraksha Setu Tourist Safety App.`;

      const phoneNumber = contact.phone.replace(/\D/g, ''); // Remove non-digits
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(smsBody)}`;

      window.location.href = smsUrl;
      return true;
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);
      window.alert(`Failed to open SMS app: ${error?.message || 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Test SMS functionality - shows what would be sent
   */
  testSMSFunctionality(contact: EmergencyContactData, data: EmergencyNotificationData) {
    const locationText = `${data.location.latitude.toFixed(6)}, ${data.location.longitude.toFixed(6)}`;
    const googleMapsUrl = `https://maps.google.com/?q=${data.location.latitude},${data.location.longitude}`;
    
    const smsBody = `🚨 EMERGENCY ALERT 🚨\n\n` +
      `${data.touristName} (ID: ${data.digitalId}) needs help!\n\n` +
      `Message: ${data.message}\n\n` +
      `Location: ${locationText}\n` +
      `Map: ${googleMapsUrl}\n\n` +
      `Time: ${data.timestamp.toLocaleString()}\n\n` +
      `This is an automated emergency notification from RakshaSetu Tourist Safety App.`;

    window.alert(`📱 SMS Test Mode\n\nThis would be sent to: ${contact.phone}\n\n${smsBody}`);
  }

  /**
   * Call emergency contact
   */
  async callEmergencyContact(contact: EmergencyContactData): Promise<boolean> {
    try {
      const phoneNumber = contact.phone.replace(/\D/g, ''); // Remove non-digits
      const phoneUrl = `tel:${phoneNumber}`;
      window.location.href = phoneUrl;
      return true;
    } catch (error) {
      console.error('Error calling emergency contact:', error);
      window.alert('Failed to initiate call');
      return false;
    }
  }

  /**
   * Show emergency contact options dialog
   */
  showEmergencyContactDialog(contact: EmergencyContactData, notificationData?: EmergencyNotificationData) {
    const contactName = contact.name || 'Emergency Contact';
    const contactInfo = contact.relation ? `${contactName} (${contact.relation})` : contactName;
    
    const action = window.prompt(
      `Emergency Contact\n\n${contactInfo}\nPhone: ${contact.phone}\n\nType 'call' to call, or 'sms' to send SMS alert:`,
      ''
    );
    
    if (action === 'call') {
      this.callEmergencyContact(contact);
    } else if (action === 'sms' && notificationData) {
      this.sendSMS(contact, notificationData);
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }
    return phone;
  }
}

export const emergencyContactService = new EmergencyContactService();
export default emergencyContactService;
