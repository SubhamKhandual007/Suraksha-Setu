import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ShieldAlert, Phone, Hospital, Hotel, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { locationService } from '../services/locationService';
import { overpassService, OverpassElement } from '../services/overpassService';
import { LocationData } from '../types';
import markerPremium from '../assets/map-marker-premium.png';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Bhubaneswar Center
const BHUBANESWAR_CENTER: [number, number] = [20.2961, 85.8245];

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const dangerIcon = new L.Icon({
  iconUrl: markerPremium,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const safeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
  iconSize: [30, 30],
});

// Emoji Icons for Services
const createEmojiIcon = (emoji: string) => L.divIcon({
  html: `<div style="font-size: 24px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 40px; height: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); border: 2px solid white;">${emoji}</div>`,
  className: 'custom-emoji-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const hospitalIcon = createEmojiIcon('🏥');
const hotelIcon = createEmojiIcon('🏨');
const policeIcon = createEmojiIcon('🚔');

// Component to recenter map
const RecenterMap = ({ coords, zoom }: { coords: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom || map.getZoom());
  }, [coords, map, zoom]);
  return null;
};

interface SafetyZone {
  id: number;
  lat: number;
  lng: number;
  radius: number;
  type: 'danger' | 'safe';
  label: string;
}

const MapScreen: React.FC = () => {
  const locationState = useLocation().state as any;
  const initialFilter = locationState?.filter;

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showSafeRoute, setShowSafeRoute] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [services, setServices] = useState<OverpassElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    hospital: initialFilter ? initialFilter === 'hospital' : true,
    hotel: initialFilter ? initialFilter === 'hotel' : true,
    police: initialFilter ? initialFilter === 'police' : true
  });

  // Mock Safety Zones for Bhubaneswar
  const safetyZones = useMemo<SafetyZone[]>(() => [
    { id: 1, lat: 20.3061, lng: 85.8345, radius: 600, type: 'danger', label: 'High Risk Zone' },
    { id: 2, lat: 20.2861, lng: 85.8145, radius: 500, type: 'danger', label: 'High Risk Zone' },
    { id: 3, lat: 20.3011, lng: 85.8195, radius: 400, type: 'safe', label: 'Safe Zone' },
    { id: 4, lat: 20.2911, lng: 85.8295, radius: 450, type: 'safe', label: 'Safe Zone' }
  ], []);

  // Mock Safe Route Polyline (Avoiding red zones)
  const safeRouteCoords: [number, number][] = [
    [20.2961, 85.8245],
    [20.2980, 85.8260],
    [20.3000, 85.8280],
    [20.3020, 85.8300],
    [20.3040, 85.8320]
  ];

  useEffect(() => {
    // Start with Bhubaneswar center if real location is not available immediately
    const initialLoc = {
      latitude: BHUBANESWAR_CENTER[0],
      longitude: BHUBANESWAR_CENTER[1],
      accuracy: 0,
      timestamp: new Date()
    };
    setCurrentLocation(initialLoc);
    fetchServices(initialLoc.latitude, initialLoc.longitude);

    const watchId = locationService.startLocationTracking(
      (loc) => {
        setCurrentLocation(loc);
        checkZoneEntry(loc);
      },
      (err) => console.error(err)
    );

    return () => locationService.stopLocationTracking();
  }, []);

  const fetchServices = async (lat: number, lon: number) => {
    setLoading(true);
    const data = await overpassService.fetchNearbyPlaces(lat, lon);
    setServices(data);
    setLoading(false);
  };

  const toggleFilter = (type: keyof typeof filters) => {
    setFilters(prev => {
      // If the clicked category is already the ONLY one selected, reset to show all
      const isOnlyOneSelected = prev[type] && Object.values(prev).filter(Boolean).length === 1;
      
      if (isOnlyOneSelected) {
        return { hospital: true, hotel: true, police: true };
      }
      
      // Otherwise, exclusively select the clicked category
      return {
        hospital: type === 'hospital',
        hotel: type === 'hotel',
        police: type === 'police'
      };
    });
  };

  const getServiceIcon = (element: OverpassElement) => {
    if (element.tags.amenity === 'hospital') return hospitalIcon;
    if (element.tags.tourism === 'hotel') return hotelIcon;
    if (element.tags.amenity === 'police') return policeIcon;
    return new L.Icon.Default();
  };

  const isVisible = (element: OverpassElement) => {
    if (element.tags.amenity === 'hospital' && filters.hospital) return true;
    if (element.tags.tourism === 'hotel' && filters.hotel) return true;
    if (element.tags.amenity === 'police' && filters.police) return true;
    return false;
  };

  // Check if user is inside a danger zone
  const checkZoneEntry = (loc: LocationData) => {
    const userLatLng = L.latLng(loc.latitude, loc.longitude);
    const inDangerZone = safetyZones.find((zone: SafetyZone) => {
      if (zone.type === 'danger') {
        const zoneLatLng = L.latLng(zone.lat, zone.lng);
        return userLatLng.distanceTo(zoneLatLng) < zone.radius;
      }
      return false;
    });

    if (inDangerZone) {
      setWarning("⚠️ Warning: You are entering a High Risk Zone. Please stay alert.");
    } else {
      setWarning(null);
    }
  };

  if (!currentLocation) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <Loader2 className="spinner" size={48} color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Loading Safety Map...</p>
      </div>
    );
  }

  const mapCenter: [number, number] = [currentLocation.latitude, currentLocation.longitude];

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="screen-title">Bhubaneswar Safety Grid</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time location & safety zones</p>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} />
          Active Protection
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative', borderRadius: '28px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
        {/* Map Container */}
        <MapContainer center={BHUBANESWAR_CENTER} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap coords={mapCenter} />

          {/* User Marker */}
          <Marker position={mapCenter} icon={userIcon}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '5px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Your Current Location</strong>
                <span className="status-badge status-safe" style={{ fontSize: '10px' }}>
                  <div className="status-dot"></div>
                  Online
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Safety Zones */}
          {safetyZones.map((zone: SafetyZone) => (
            <React.Fragment key={zone.id}>
              <Circle 
                center={[zone.lat, zone.lng]} 
                radius={zone.radius} 
                pathOptions={{ 
                  color: zone.type === 'danger' ? '#ef4444' : '#10b981', 
                  fillColor: zone.type === 'danger' ? '#ef4444' : '#10b981', 
                  fillOpacity: 0.15,
                  weight: 2
                }} 
              />
              <Marker position={[zone.lat, zone.lng]} icon={zone.type === 'danger' ? dangerIcon : safeIcon}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ color: zone.type === 'danger' ? '#ef4444' : '#10b981', fontSize: '14px' }}>{zone.label}</strong>
                    <p style={{ fontSize: '12px', margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                      {zone.type === 'danger' ? 'Exercise extreme caution.' : 'Relatively safe area for tourists.'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {services.filter(isVisible).map(service => {
            const lat = service.lat || service.center?.lat;
            const lon = service.lon || service.center?.lon;
            
            if (!lat || !lon) return null;

            return (
              <Marker 
                key={service.id} 
                position={[lat, lon]} 
                icon={getServiceIcon(service)}
              >
                <Popup>
                  <div style={{ padding: '8px', minWidth: '180px' }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--dark)', marginBottom: '4px' }}>
                      {service.tags.name || 'Unnamed Facility'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      <MapPin size={12} />
                      {service.tags.amenity || service.tags.tourism || 'Service'} • {currentLocation && overpassService.getDistance(currentLocation.latitude, currentLocation.longitude, lat, lon)} km away
                    </div>
                    
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank')}
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      <Navigation size={14} />
                      Navigate
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Safe Route Polyline */}
          {showSafeRoute && (
            <Polyline 
              positions={safeRouteCoords} 
              pathOptions={{ color: '#6366f1', weight: 5, dashArray: '10, 10', lineCap: 'round' }} 
            />
          )}
        </MapContainer>

        {/* Warning Toast */}
        {warning && (
          <div className="fade-in" style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1001,
            width: 'calc(100% - 40px)',
            maxWidth: '400px'
          }}>
            <div style={{ 
              backgroundColor: '#fef2f2', 
              color: '#dc2626', 
              padding: '16px', 
              borderRadius: '16px', 
              boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2)',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={24} />
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{warning}</span>
            </div>
          </div>
        )}

        {/* Filter Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: warning ? '100px' : '20px', 
          left: '20px', 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          <button 
            onClick={() => toggleFilter('hospital')}
            style={{ 
              background: filters.hospital ? 'white' : 'rgba(255,255,255,0.7)', 
              border: 'none', 
              padding: '10px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              fontWeight: '700',
              cursor: 'pointer',
              color: filters.hospital ? 'var(--dark)' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ opacity: filters.hospital ? 1 : 0.5 }}>🏥</div>
            Hospitals
          </button>
          <button 
            onClick={() => toggleFilter('hotel')}
            style={{ 
              background: filters.hotel ? 'white' : 'rgba(255,255,255,0.7)', 
              border: 'none', 
              padding: '10px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              fontWeight: '700',
              cursor: 'pointer',
              color: filters.hotel ? 'var(--dark)' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ opacity: filters.hotel ? 1 : 0.5 }}>🏨</div>
            Hotels
          </button>
          <button 
            onClick={() => toggleFilter('police')}
            style={{ 
              background: filters.police ? 'white' : 'rgba(255,255,255,0.7)', 
              border: 'none', 
              padding: '10px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              fontWeight: '700',
              cursor: 'pointer',
              color: filters.police ? 'var(--dark)' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ opacity: filters.police ? 1 : 0.5 }}>🚔</div>
            Police
          </button>
        </div>

        {/* Legend Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: warning ? '100px' : '20px', 
          right: '20px', 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px' 
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '8px 12px', borderRadius: '12px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', backdropFilter: 'blur(5px)' }}>
            <img src={markerPremium} alt="Danger" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            High Risk
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '8px 12px', borderRadius: '12px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', backdropFilter: 'blur(5px)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
            Safe Zone
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)', padding: '14px', borderRadius: '16px' }}
            onClick={() => setShowSafeRoute(!showSafeRoute)}
          >
            {showSafeRoute ? <CheckCircle2 size={18} /> : <Navigation size={18} />}
            {showSafeRoute ? 'Safe Path Shown' : 'Find Safe Path'}
          </button>
        </div>

        {/* Disclaimer Footer */}
        <div style={{ 
          position: 'absolute', 
          bottom: '85px', 
          left: '20px', 
          right: '20px', 
          zIndex: 999,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '10px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Info size={14} />
          <span>Note: Zones are based on generalized safety data for demonstration purposes.</span>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
