// Shared in-memory + sessionStorage log for QR verification events
// Written by AdminQRScannerScreen, read by AdminNotificationsScreen

export interface VerificationEvent {
  id: string;
  touristName: string;
  digitalId: string;
  phone: string;
  timestamp: string; // ISO string
}

const STORAGE_KEY = 'qr_verification_log';

export const verificationLog = {
  add(event: Omit<VerificationEvent, 'id'>): void {
    const existing = this.getAll();
    const newEvent: VerificationEvent = { id: `vlog-${Date.now()}`, ...event };
    // Keep latest 20 events
    const updated = [newEvent, ...existing].slice(0, 20);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getAll(): VerificationEvent[] {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
