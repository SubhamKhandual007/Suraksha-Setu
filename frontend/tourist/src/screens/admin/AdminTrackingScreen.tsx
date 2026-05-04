import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CircularProgress, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { LocalPolice } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { zoneService, SafetyZone } from '../../services/zoneService';
import { apiService, User } from '../../services/api';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const policeIcon = L.divIcon({
  html: renderToString(
    <div style={{ 
      backgroundColor: '#ef4444', 
      borderRadius: '50%', 
      width: '32px', 
      height: '32px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      border: '2px solid white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
    }}>
      <LocalPolice style={{ color: 'white', fontSize: '20px' }} />
    </div>
  ),
  className: 'custom-police-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const BHUBANESWAR_CENTER: [number, number] = [20.2961, 85.8245];

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const AdminTrackingScreen: React.FC = () => {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [tourists, setTourists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const qLat = queryParams.get('lat');
  const qLng = queryParams.get('lng');
  
  const mapCenter: [number, number] = (qLat && qLng) 
    ? [parseFloat(qLat), parseFloat(qLng)] 
    : BHUBANESWAR_CENTER;

  useEffect(() => {
    // Load local zones (Filter out incident-based zones to prefer DB version)
    const localZones = zoneService.getAll().filter(z => !String(z.id || '').startsWith('inc_'));
    setZones(localZones);
    
    // Load real tourists from API and also fetch incident-based zones
    const fetchData = async () => {
      try {
        const [userRes, incidentRes] = await Promise.all([
          apiService.getAllUsers(),
          apiService.getAll() // Fetch all incidents to check for marked zones
        ]);

        if (userRes.success && userRes.users) {
          setTourists(userRes.users.filter((u: User) => u.role === 'tourist'));
        }

        if (incidentRes.success && incidentRes.reports) {
          console.log('Fetched Incidents:', incidentRes.reports.length);
          const incidentZones: SafetyZone[] = incidentRes.reports
            .filter((inc: any) => inc.markedAsZone && inc.zoneType)
            .map((inc: any) => ({
              id: `inc_${inc._id}`,
              name: `Incident Zone: ${inc.incidentId}`,
              type: inc.zoneType === 'high_risk' ? 'danger' : 'caution',
              lat: inc.location.latitude || 20.2961,
              lng: inc.location.longitude || 85.8245,
              radius: inc.zoneType === 'high_risk' ? 800 : 500,
              reason: inc.reportType
            }));
          
          console.log('Generated Incident Zones:', incidentZones);
          
          // Merge local and incident zones (Update if exists, else add)
          setZones(prev => {
            const newZonesMap = new Map();
            // Start with current zones
            prev.forEach(z => newZonesMap.set(z.id, z));
            // Overwrite/Add incident zones
            incidentZones.forEach(iz => newZonesMap.set(iz.id, iz));
            const result = Array.from(newZonesMap.values());
            console.log('Total Zones on Map:', result.length);
            return result;
          });
        }
      } catch (err) {
        console.error('Failed to fetch tracking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3, height: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
            Live Tourist Tracking
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Real-time monitoring of all active tourists within safety zones.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Chip label={`${tourists.length} Tourists Active`} color="primary" sx={{ fontWeight: 700 }} />
          <Chip label={`${zones.filter(z => z.type === 'safe').length} Safe`} color="success" sx={{ fontWeight: 700 }} />
          <Chip label={`${zones.filter(z => z.type === 'caution').length} Caution`} color="warning" sx={{ fontWeight: 700 }} />
          <Chip label={`${zones.filter(z => z.type === 'danger').length} High-Risk`} color="error" sx={{ fontWeight: 700 }} />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 220px)' }}>
        <Card sx={{ flex: 1, borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <MapContainer center={mapCenter} zoom={(qLat && qLng) ? 16 : 13} style={{ height: '100%', width: '100%' }}>
            <MapUpdater center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render Safety/Danger Zones */}
            {zones.map((zone) => (
              <React.Fragment key={`${zone.id}-${zone.lat}-${zone.lng}`}>
                <Circle
                  center={[zone.lat, zone.lng]}
                  radius={zone.radius}
                  pathOptions={{
                    color: zone.type === 'danger' ? '#ef4444' : zone.type === 'caution' ? '#f59e0b' : '#22c55e',
                    fillColor: zone.type === 'danger' ? '#ef4444' : zone.type === 'caution' ? '#f59e0b' : '#22c55e',
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                >
                  <Popup>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{zone.name}</Typography>
                    <Typography variant="body2">Type: {zone.type.toUpperCase()}</Typography>
                    <Typography variant="body2">Radius: {zone.radius}m</Typography>
                    {zone.reason && (
                      <Typography variant="caption" color="error" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                        ⚠️ {zone.reason}
                      </Typography>
                    )}
                  </Popup>
                </Circle>

                {/* Add Police Icon to Danger Zones */}
                {zone.type === 'danger' && (
                  <Marker position={[zone.lat, zone.lng]} icon={policeIcon}>
                    <Popup>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                        👮 Police Monitoring Active
                      </Typography>
                      <Typography variant="body2">{zone.name}</Typography>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            ))}

            {/* Render Tourists */}
            {tourists.map((tourist) => {
              const position: [number, number] = tourist.location 
                ? [tourist.location.latitude, tourist.location.longitude] 
                : [BHUBANESWAR_CENTER[0], BHUBANESWAR_CENTER[1]]; 
              
              if (!tourist.location) return null;

              return (
                <Marker key={tourist.id || (tourist as any)._id} position={position}>
                  <Popup>
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{tourist.name}</Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>ID: {tourist.digitalId}</Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>Status: {tourist.status || 'SAFE'}</Typography>
                    </Box>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Card>

        {/* Sidebar Zone List for Debugging/Better UX */}
        <Card sx={{ width: 300, p: 2, borderRadius: 4, display: { xs: 'none', md: 'block' }, overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Active Zones</Typography>
          {zones.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No zones active</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {zones.map(z => (
                <Box key={z.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', borderLeft: `4px solid ${z.type === 'danger' ? '#ef4444' : z.type === 'caution' ? '#f59e0b' : '#22c55e'}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{z.name}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>{z.type.toUpperCase()}</Typography>
                  <Typography variant="caption" color="text.secondary">{z.lat.toFixed(4)}, {z.lng.toFixed(4)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default AdminTrackingScreen;
