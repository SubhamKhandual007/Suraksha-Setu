import io from 'socket.io-client';
import { API_BASE_URL } from '../config';

class SocketService {
  private socket: any = null;
  private isConnected = false;
  private token: string | null = null;
  private initialized = false;
  
  constructor() {
    // Don't auto-connect — wait for explicit authentication
  }

  // Lazy initialization: only connect when we have a token
  private async initializeSocket() {
    if (this.initialized && this.socket?.connected) return;
    
    try {
      this.token = localStorage.getItem('authToken');
      
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      const SOCKET_URL = API_BASE_URL;
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        forceNew: true,
        autoConnect: true,
      });

      this.setupEventListeners();
      this.initialized = true;
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('Socket authenticated successfully:', data);
    });

    this.socket.on('auth_error', (error: any) => {
      console.error('Socket authentication error:', error);
    });

    this.socket.on('emergency_sent', (data: any) => {
      console.log('Emergency alert sent:', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    this.socket.on('pong', (data: any) => {
      console.log('Pong received:', data);
    });
  }

  private async authenticate() {
    if (!this.socket || !this.isConnected) {
      return;
    }

    try {
      const realToken = localStorage.getItem('authToken');

      if (realToken) {
        this.socket.emit('authenticate', {
          token: realToken,
          userType: 'tourist'
        });
      } else {
        this.socket.emit('authenticate', {
          token: 'tourist-demo-token',
          userType: 'tourist'
        });
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }

  // Send location update to server
  public sendLocationUpdate(location: any) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot send location');
      return;
    }
    
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot send location');
      this.reconnect();
      return;
    }

    console.log('Sending location update via socket:', location);
    this.socket.emit('location_update', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(),
      source: 'web_app'
    });
  }

  // Send emergency alert
  public sendEmergencyAlert(location: any, message?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected, cannot send emergency alert');
      return false;
    }

    this.socket.emit('emergency_alert', {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 100
      },
      message: message || 'Emergency assistance needed',
      timestamp: new Date()
    });

    return true;
  }

  // Ping server to check connection
  public ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Reconnect if needed
  public async reconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.initialized = false;
    await this.initializeSocket();
  }

  // Update token (when user logs in) — this triggers lazy initialization
  public async updateToken(newToken: string) {
    this.token = newToken;
    localStorage.setItem('authToken', newToken);
    
    if (!this.initialized) {
      // First time — initialize the socket
      await this.initializeSocket();
    } else if (this.isConnected) {
      this.authenticate();
    } else {
      // Reconnect with new token
      await this.reconnect();
    }
  }

  // Disconnect socket
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.initialized = false;
    }
  }

  // Get connection status
  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      hasToken: !!this.token
    };
  }

  // Subscribe to events
  public on(event: string, callback: (data: any) => void) {
    if (!this.socket && !this.initialized) {
      // If socket isn't initialized yet, do it now
      this.initializeSocket().then(() => {
        if (this.socket) {
          this.socket.on(event, callback);
        }
      });
      return;
    }
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from events
  public off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketServiceInstance = new SocketService();
export default socketServiceInstance;
