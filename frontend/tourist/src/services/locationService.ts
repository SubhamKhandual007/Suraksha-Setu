import { LocationData } from '../types';

export class LocationService {
  private watchId: number | null = null;

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    console.log('Requesting location permission...');
    // In browsers, permissions are asked automatically when you try to use the API
    return true;
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained from GPS:', position.coords);
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
          };
          resolve(locationData);
        },
        (error) => {
          console.error('Location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Start watching location changes
  startLocationTracking(
    onLocationUpdate: (location: LocationData) => void,
    onError: (error: any) => void
  ): void {
    console.log('Starting location tracking...');
    
    if (!navigator.geolocation) {
      onError(new Error('Geolocation is not supported by your browser'));
      return;
    }

    if (this.watchId !== null) {
      console.log('Stopping existing watch first...');
      this.stopLocationTracking();
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Location update received:', position.coords);
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
        };
        onLocationUpdate(locationData);
      },
      (error) => {
        console.error('Location tracking error:', error);
        onError(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000
      }
    );
    
    console.log('Watch ID set to:', this.watchId);
  }

  // Stop watching location changes
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Format location for display
  formatLocation(location: LocationData): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
