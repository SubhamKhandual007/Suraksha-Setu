import axios from 'axios';
import { API_BASE_URL } from '../config';

// Configure base URL 
const BASE_URL = `${API_BASE_URL}/api`; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  emergencyContact: string;
  role?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  digitalId: string;
  status?: 'SAFE' | 'EMERGENCY';
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  registrationTimestamp?: string;
  createdAt: string;
  role: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface EmergencyAlert {
  alertId: string;
  _id?: string;
  userId: string;
  digitalId: string;
  type: string;
  emergencyType?: string;
  priority?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  status: string;
  message: string;
  resolvedAt?: string;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  lastAlert: EmergencyAlert | null;
}

export interface IncidentReport {
  _id: string;
  incidentId: string;
  tourist?: { name: string; email: string; digitalId: string; phone: string };
  touristName: string;
  touristDigitalId: string;
  reportType: 'tourist_in_danger' | 'theft_report' | 'harassment_report' | 'lost_tourist' |
              'unsafe_area_alert' | 'medical_emergency' | 'suspicious_activity' | 'sos_alert' | 'other';
  title: string;
  description: string;
  location: { latitude: number; longitude: number; address: string; city: string };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'responding' | 'resolved' | 'dismissed';
  assignedTo: string;
  adminNotes: string;
  resolvedAt?: string;
  markedAsZone: boolean;
  zoneType: '' | 'caution' | 'high_risk';
  source: 'tourist_report' | 'sos_alert' | 'admin_created';
  createdAt: string;
  updatedAt: string;
}

export interface IncidentStats {
  total: number;
  active: number;
  resolved: number;
  critical: number;
  highAlertZones: number;
  byType: { _id: string; count: number }[];
}

// Authentication API calls
export const authAPI = {
  login: async (loginData: LoginData) => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  register: async (registerData: RegisterData) => {
    const response = await api.post('/auth/register', registerData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  
  firebaseLogin: async (token: string, role: string = 'admin') => {
    const response = await api.post('/auth/firebase-login', { token, role });
    return response.data;
  },

  verifyDigitalId: async (digitalId: string) => {
    const response = await api.get(`/auth/verify/${digitalId}`);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};

// Location API calls
export const locationAPI = {
  updateLocation: async (locationData: LocationData) => {
    const response = await api.post('/location/update', locationData);
    return response.data;
  },

  getLocationHistory: async () => {
    const response = await api.get('/location/history');
    return response.data;
  },
};

export interface Activity {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  digitalId?: string;
  userName?: string;
  type: 'SOS_ALERT' | 'DIGITAL_ID_CHECK' | 'LOGIN' | 'REGISTER' | 'SYSTEM';
  action: string;
  details: any;
  status: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  timestamp: string;
}

// Emergency API calls
export const emergencyAPI = {
  sendAlert: async (alertData: any) => {
    const response = await api.post('/emergency/alert', alertData);
    return response.data;
  },

  getAlertHistory: async () => {
    const response = await api.get('/emergency/history');
    return response.data;
  },
  
  getAlertStats: async () => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },

  getEmergencyAlerts: async () => {
    const response = await api.get('/alerts/emergency');
    return response.data;
  },

  resolveAlert: async (alertId: string) => {
    const response = await api.post(`/alerts/${alertId}/resolve`);
    return response.data;
  },

  getSocketStats: async () => {
    const response = await api.get('/socket/stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/admin/activities');
    return response.data;
  },
};

// Payment API calls
export const paymentAPI = {
  createPaymentIntent: async (paymentData: { amount: number; hotelName: string }) => {
    const response = await api.post('/payment/create-payment-intent', paymentData);
    return response.data;
  },
};

// Ambulance API calls
export const ambulanceAPI = {
  getAvailableAmbulances: async () => {
    const response = await api.get('/ambulance/available');
    return response.data;
  },
  bookAmbulance: async (bookingData: any) => {
    const response = await api.post('/ambulance/book', bookingData);
    return response.data;
  },
  getTrackingStatus: async (token: string) => {
    const response = await api.get(`/ambulance/tracking/${token}`);
    return response.data;
  },
  logCall: async (callData: { bookingId: string; userId: string; driverPhone: string }) => {
    const response = await api.post('/ambulance/call-log', callData);
    return response.data;
  }
};

// Incident Reports API calls
export const incidentAPI = {
  getAll: async (params?: {
    status?: string; severity?: string; reportType?: string;
    search?: string; page?: number; limit?: number;
  }) => {
    const response = await api.get('/incidents', { params });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/incidents/stats');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  create: async (data: Partial<IncidentReport>) => {
    const response = await api.post('/incidents', data);
    return response.data;
  },
  updateStatus: async (id: string, data: { status: string; adminNotes?: string; assignedTo?: string }) => {
    const response = await api.patch(`/incidents/${id}/status`, data);
    return response.data;
  },
  markZone: async (id: string, zoneType: string) => {
    const response = await api.patch(`/incidents/${id}/zone`, { zoneType });
    return response.data;
  },
  createFromSOS: async (data: any) => {
    const response = await api.post('/incidents/from-sos', data);
    return response.data;
  },
};

// Community Chat API calls
export const communityAPI = {
  getMessages: async (params?: { limit?: number; before?: string }) => {
    const response = await api.get('/community/messages', { params });
    return response.data;
  },
  reportMessage: async (messageId: string) => {
    const response = await api.post(`/community/report/${messageId}`);
    return response.data;
  },
  searchMessages: async (q: string) => {
    const response = await api.get('/community/search', { params: { q } });
    return response.data;
  },
};

// Unified apiService (for backward compatibility with admin components)
export const apiService = {
  ...authAPI,
  ...locationAPI,
  ...emergencyAPI,
  ...paymentAPI,
  ...ambulanceAPI,
  ...incidentAPI,
  ...communityAPI,
  registerUser: authAPI.register,
};

// Utility functions for token management
export const tokenManager = {
  setToken: (token: string) => {
    sessionStorage.setItem('authToken', token);
  },

  getToken: () => {
    return sessionStorage.getItem('authToken');
  },

  removeToken: () => {
    sessionStorage.removeItem('authToken');
  },

  setUserData: (userData: any) => {
    sessionStorage.setItem('userData', JSON.stringify(userData));
  },

  getUserData: (): any | null => {
    const userData = sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  removeUserData: () => {
    sessionStorage.removeItem('userData');
  },
};

export default api;
