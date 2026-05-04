import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Ambulance, 
  MapPin, 
  Phone, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Navigation, 
  CheckCircle2, 
  AlertOctagon,
  Stethoscope,
  Heart,
  Flame,
  Activity,
  CreditCard,
  Lock,
  Bell,
  Search,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ambulanceAPI, tokenManager } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { locationService } from '../services/locationService';
import { LocationData } from '../types';

// Fix for Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords);
  }, [coords, map]);
  return null;
};

const createAmbulanceIcon = (type: string) => L.divIcon({
  html: `<div style="background-color: ${type === 'Government' ? '#3b82f6' : '#10b981'}; border-radius: 50%; padding: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: 2px solid white;"><span style="font-size: 18px;">🚑</span></div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const AmbulanceBookingScreen: React.FC = () => {
  const [step, setStep] = useState<'booking' | 'tracking'>('booking');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [mapFilter, setMapFilter] = useState<'All' | 'Government' | 'Private'>('All');
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<'Dispatched' | 'Arriving' | 'Arrived'>('Dispatched');
  const [ambulanceLiveLoc, setAmbulanceLiveLoc] = useState<{lat: number, lng: number} | null>(null);
  
  const bhubaneswarHospitalsData = [
    { id: 1, name: 'AIIMS Bhubaneswar, Sijua', lat: 20.2361, lng: 85.7656, type: 'Government', status: 'Available' },
    { id: 2, name: 'Apollo Hospitals, Gajapati Nagar', lat: 20.3080, lng: 85.8245, type: 'Private', status: 'Available' },
    { id: 3, name: 'KIMS Hospital, Patia', lat: 20.3541, lng: 85.8166, type: 'Private', status: 'Busy' },
    { id: 4, name: 'Capital Hospital, Unit-6', lat: 20.2644, lng: 85.8184, type: 'Government', status: 'Available' },
    { id: 5, name: 'SUM Hospital, Ghatikia', lat: 20.2801, lng: 85.7656, type: 'Private', status: 'Busy' },
    { id: 6, name: 'Care Hospitals, Chandrasekharpur', lat: 20.3204, lng: 85.8175, type: 'Private', status: 'Available' },
    { id: 7, name: 'Blue Wheel Hospital, Mancheswar', lat: 20.3168, lng: 85.8451, type: 'Private', status: 'Available' },
    { id: 8, name: 'AMRI Hospitals, Khandagiri', lat: 20.2678, lng: 85.7876, type: 'Private', status: 'Busy' }
  ];
  const bhubaneswarHospitals = bhubaneswarHospitalsData.map(h => h.name);

  const [formData, setFormData] = useState({
    category: 'Emergency',
    condition: 'Critical (Accident, Cardiac Arrest, ...)',
    location: 'Fetching your location...',
    hospital: bhubaneswarHospitals[0],
    emergencyDescription: '',
    ambulanceType: 'Basic Life Support (BLS)',
    paymentMethod: 'UPI',
    shareMedicalHistory: false,
    selectedTags: [] as string[]
  });

  const { isAuthenticated } = useAuth();
  const user = tokenManager.getUserData();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const loc = await locationService.getCurrentLocation();
        setUserLocation(loc);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.display_name) {
            const addressParts = [];
            if (data.address.road) addressParts.push(data.address.road);
            if (data.address.suburb) addressParts.push(data.address.suburb);
            if (data.address.city || data.address.town || data.address.village) addressParts.push(data.address.city || data.address.town || data.address.village);
            if (data.address.state) addressParts.push(data.address.state);
            
            const shortAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name;
            setFormData(prev => ({ ...prev, location: shortAddress }));
          } else {
            setFormData(prev => ({ ...prev, location: 'Your Current Location' }));
          }
        } catch (addrErr) {
          setFormData(prev => ({ ...prev, location: 'Your Current Location' }));
        }

      } catch (err) {
        setUserLocation({ latitude: 20.2961, longitude: 85.8245, timestamp: new Date() } as LocationData);
        setFormData(prev => ({ ...prev, location: 'Cuttack Sadar, Odisha' }));
      }
    };
    fetchLocation();
  }, []);

  const emergencyTags = [
    { label: 'Accident', icon: <AlertOctagon size={14} />, color: '#fee2e2', textColor: '#ef4444' },
    { label: 'Heart Issue', icon: <Heart size={14} />, color: '#fee2e2', textColor: '#ef4444' },
    { label: 'Fever', icon: <Flame size={14} />, color: '#fff7ed', textColor: '#f97316' },
    { label: 'Bleeding', icon: <DropletIcon size={14} />, color: '#fee2e2', textColor: '#ef4444' }
  ];

  useEffect(() => {
    let interval: any;
    if (step === 'tracking' && userLocation && trackingStatus !== 'Arrived') {
      interval = setInterval(() => {
        setAmbulanceLiveLoc(prev => {
          if (!prev) return prev;
          
          const dLat = userLocation.latitude - prev.lat;
          const dLng = userLocation.longitude - prev.lng;
          const dist = Math.sqrt(dLat*dLat + dLng*dLng);
          
          if (dist < 0.0005) {
             setTimeout(() => setTrackingStatus('Arrived'), 0);
             return { lat: userLocation.latitude, lng: userLocation.longitude };
          } else if (dist < 0.01 && trackingStatus === 'Dispatched') {
             setTimeout(() => setTrackingStatus('Arriving'), 0);
          }
          
          const stepSize = dist > 0.01 ? 0.0008 : 0.0003; 
          const ratio = stepSize / dist;
          
          return {
            lat: prev.lat + dLat * Math.min(ratio, 1),
            lng: prev.lng + dLng * Math.min(ratio, 1)
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, userLocation, trackingStatus]);

  const handleBook = async () => {
    setLoading(true);
    // Simulate booking for now to show tracking
    setTimeout(() => {
      const hosp = bhubaneswarHospitalsData.find(h => h.name === formData.hospital);
      if (hosp) {
        setAmbulanceLiveLoc({ lat: hosp.lat, lng: hosp.lng });
      } else if (userLocation) {
        setAmbulanceLiveLoc({ lat: userLocation.latitude + 0.01, lng: userLocation.longitude + 0.01 });
      }

      setBooking({
        id: 'BKW46L6WE8K',
        status: 'Dispatched',
        timestamp: new Date().toISOString()
      });
      setDriver({
        name: 'Ramesh Singh',
        phone: '+91 9876543210',
        number: 'OD-02-AX-1234'
      });
      setStep('tracking');
      setTrackingStatus('Dispatched');
      setLoading(false);
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedTags.includes(tag);
      const newTags = isSelected 
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag];
      
      let newDesc = prev.emergencyDescription;
      if (isSelected) {
        const descParts = newDesc.split(',').map(s => s.trim()).filter(s => s !== '' && s !== tag);
        newDesc = descParts.join(', ');
      } else {
        const descParts = newDesc.split(',').map(s => s.trim()).filter(s => s !== '');
        if (!descParts.includes(tag)) {
          descParts.push(tag);
        }
        newDesc = descParts.join(', ');
      }

      return {
        ...prev,
        selectedTags: newTags,
        emergencyDescription: newDesc
      };
    });
  };

  const inputGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'white',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#065f46',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  if (step === 'tracking' && booking) {
    return (
      <div className="fade-in" style={{ padding: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', background: '#f0fdf4' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <button onClick={() => setStep('booking')} style={{ background: 'white', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ChevronLeft size={20} color="#059669" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#065f46', textTransform: 'uppercase', letterSpacing: '1px' }}>TRACKING AMBULANCE 🚑</h1>
        </div>

        <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '2px solid #10b981', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Estimated Arrival</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#065f46' }}>
                {trackingStatus === 'Arrived' ? 'Arrived' : trackingStatus === 'Arriving' ? '2 - 3 Mins' : '8 - 12 Mins'}
              </div>
            </div>
            <div style={{ background: trackingStatus === 'Arrived' ? '#10b981' : '#d1fae5', color: trackingStatus === 'Arrived' ? 'white' : '#059669', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', border: '1px solid #10b981' }}>
              ● {trackingStatus.toUpperCase()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '15px' }}>
             <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ambulance size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '900', fontSize: '18px', color: '#1e293b' }}>{driver?.number}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{formData.ambulanceType}</div>
            </div>
            <a href={`tel:${driver?.phone}`} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Phone size={20} />
            </a>
          </div>
        </div>

        {/* Live Map Area */}
        <div style={{ height: '250px', borderRadius: '20px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
           {userLocation && ambulanceLiveLoc && (
            <MapContainer 
              center={[userLocation.latitude, userLocation.longitude]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
              <Marker position={[userLocation.latitude, userLocation.longitude]}>
                <Popup>Your Location</Popup>
              </Marker>
              <Marker position={[ambulanceLiveLoc.lat, ambulanceLiveLoc.lng]} icon={createAmbulanceIcon('Government')}>
                 <Popup>Ambulance En Route</Popup>
              </Marker>
            </MapContainer>
           )}
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
           <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#065f46', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Navigation size={18} /> ROUTE STATUS
           </h3>
           <div style={{ position: 'relative', paddingLeft: '30px' }}>
            <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }}></div>
            
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '3px solid white', boxShadow: '0 0 0 2px #10b981' }}></div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>Booking Confirmed</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Assigned to {driver?.name}</div>
            </div>

            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: trackingStatus === 'Arrived' ? '#10b981' : '#3b82f6', border: '3px solid white', boxShadow: trackingStatus !== 'Arrived' ? '0 0 0 2px #3b82f6' : 'none' }}></div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: trackingStatus === 'Arrived' ? '#1e293b' : '#3b82f6' }}>Driver En Route</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Heading to your pickup location</div>
            </div>

            <div style={{ position: 'relative', opacity: trackingStatus === 'Arrived' ? 1 : 0.5 }}>
              <div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: trackingStatus === 'Arrived' ? '#10b981' : '#cbd5e1', border: '3px solid white', boxShadow: trackingStatus === 'Arrived' ? '0 0 0 2px #10b981' : 'none' }}></div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: trackingStatus === 'Arrived' ? '#1e293b' : '#64748b' }}>Arrival at Location</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Journey completion</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="btn" 
          style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', fontWeight: '900', border: '2px solid #fecaca' }}
        >
          {trackingStatus === 'Arrived' ? 'FINISH' : 'CANCEL BOOKING'}
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', background: '#f0fdf4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'white', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ChevronLeft size={20} color="#059669" />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: '#065f46', textTransform: 'uppercase', letterSpacing: '1px' }}>BOOK AN AMBULANCE 🚑</h1>
      </div>

      {/* Booking Form Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Category */}
        <div style={inputGroupStyle}>
          <Ambulance size={20} color="#059669" />
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: '700', color: '#1e293b', fontSize: '15px' }}
          >
            <option>Emergency</option>
            <option>Non-Emergency</option>
            <option>Inter-Hospital Transfer</option>
          </select>
          <ChevronDownIcon />
        </div>

        {/* Condition */}
        <div style={inputGroupStyle}>
          <AlertTriangle size={20} color="#ef4444" />
          <select 
            value={formData.condition}
            onChange={(e) => setFormData({...formData, condition: e.target.value})}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: '700', color: '#475569', fontSize: '14px' }}
          >
            <option>Critical (Accident, Cardiac Arrest, ...)</option>
            <option>Serious (Severe Pain, Bleeding, ...)</option>
            <option>Stable (Routine Checkup, Minor Injury)</option>
          </select>
          <ChevronDownIcon />
        </div>

        {/* Location */}
        <div style={{ ...inputGroupStyle, padding: '6px 6px 6px 16px' }}>
          <MapPin size={20} color="#059669" />
          <input 
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: '700', color: '#475569', fontSize: '14px' }}
          />
          <button 
            onClick={() => setShowMapSelector(true)}
            style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
          >
            Pin Location
          </button>
        </div>

        {/* Map Selector Modal */}
        {showMapSelector && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontWeight: '800', color: '#065f46' }}>Select Pickup Location</h3>
                <button onClick={() => setShowMapSelector(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ height: '400px', position: 'relative' }}>
                <MapContainer center={[userLocation?.latitude || 20.2961, userLocation?.longitude || 85.8245]} zoom={17} style={{ height: '100%', width: '100%' }}>
                  {/* Using Google Maps Satellite Hybrid view for a realistic 3D-like look */}
                  <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
                  <LocationPicker onSelect={async (lat, lng) => {
                    setFormData({...formData, location: 'Fetching location name...'});
                    setShowMapSelector(false);
                    try {
                      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                      const data = await response.json();
                      if (data && data.display_name) {
                        // Use a shorter version of the address if possible, or just the full display name
                        const addressParts = [];
                        if (data.address.road) addressParts.push(data.address.road);
                        if (data.address.suburb) addressParts.push(data.address.suburb);
                        if (data.address.city || data.address.town || data.address.village) addressParts.push(data.address.city || data.address.town || data.address.village);
                        if (data.address.state) addressParts.push(data.address.state);
                        
                        const shortAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name;
                        setFormData(prev => ({...prev, location: shortAddress}));
                      } else {
                        setFormData(prev => ({...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)} (Pinned Location)`}));
                      }
                    } catch (error) {
                      console.error('Error fetching location:', error);
                      setFormData(prev => ({...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)} (Pinned Location)`}));
                    }
                  }} />
                </MapContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 1000 }}>
                  <MapPin size={32} color="#ef4444" fill="#fee2e2" />
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <button 
                  onClick={() => {
                    // In a real app, we'd get the center coordinates
                    setShowMapSelector(false);
                  }}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '15px', borderRadius: '15px' }}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hospital */}
        <div style={inputGroupStyle}>
          <HospitalIcon size={20} color="#059669" />
          <select 
            value={formData.hospital}
            onChange={(e) => setFormData({...formData, hospital: e.target.value})}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: '700', color: '#475569', fontSize: '14px' }}
          >
            {bhubaneswarHospitals.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <ChevronDownIcon />
        </div>

        {/* Emergency Description */}
        <div className="card" style={{ padding: '15px', borderRadius: '15px' }}>
          <label style={labelStyle}>
            <AlertTriangle size={18} color="#ef4444" /> Describe the Emergency (Optional)
          </label>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {emergencyTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => toggleTag(tag.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: formData.selectedTags.includes(tag.label) ? `2px solid ${tag.textColor}` : '1.5px solid #e2e8f0',
                  background: tag.color,
                  color: tag.textColor,
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {tag.icon} {tag.label}
              </button>
            ))}
          </div>

          <textarea 
            placeholder="e.g., Accident, Chest pain, High fever"
            value={formData.emergencyDescription}
            onChange={(e) => setFormData({...formData, emergencyDescription: e.target.value})}
            style={{ 
              width: '100%', 
              height: '80px', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '12px', 
              fontSize: '14px', 
              outline: 'none',
              resize: 'none',
              fontStyle: 'italic',
              color: '#64748b'
            }}
          />
        </div>

        {/* Ambulance Type */}
        <div style={inputGroupStyle}>
          <Ambulance size={20} color="#059669" />
          <select 
            value={formData.ambulanceType}
            onChange={(e) => setFormData({...formData, ambulanceType: e.target.value})}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: '700', color: '#475569', fontSize: '14px' }}
          >
            <option>Basic Life Support (BLS)</option>
            <option>Advanced Life Support (ALS)</option>
            <option>Government 108</option>
            <option>Air Ambulance</option>
          </select>
          <ChevronDownIcon />
        </div>

        {/* Payment */}
        <div style={inputGroupStyle}>
          <CreditCard size={20} color="#059669" />
          <select 
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: '700', color: '#475569', fontSize: '14px' }}
          >
            <option>UPI</option>
            <option>Cash</option>
            <option>Card</option>
            <option>Stripe</option>
          </select>
          <ChevronDownIcon />
        </div>

        {/* Privacy Checkbox 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
           <Lock size={18} color="#64748b" />
           <input 
            type="checkbox" 
            checked={formData.shareMedicalHistory} 
            onChange={(e) => setFormData({...formData, shareMedicalHistory: e.target.checked})}
            style={{ width: '16px', height: '16px', accentColor: '#10b981' }} 
           />
           <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
             Share Medical History with Paramedics & Hospital
           </span>
        </div>

        <button 
          onClick={handleBook}
          disabled={loading}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: '900', background: '#10b981', color: 'white', border: 'none', marginTop: '10px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
        >
          {loading ? 'BOOKING...' : 'Book Ambulance'}
        </button>

        {/* Availability Map Section */}
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            AMBULANCE AVAILABILITY MAP 🚑
          </h2>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['All', 'Government', 'Private'].map((filter) => (
              <button
                key={filter}
                onClick={() => setMapFilter(filter as any)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: mapFilter === filter ? '#10b981' : 'white',
                  color: mapFilter === filter ? 'white' : '#059669',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  flex: 1
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <div style={{ height: '250px', borderRadius: '20px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
             {userLocation && (
              <MapContainer 
                center={[userLocation.latitude, userLocation.longitude]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                  <Popup>Your Location</Popup>
                </Marker>
                
                {bhubaneswarHospitalsData.filter(a => mapFilter === 'All' || a.type === mapFilter).map(amb => (
                  <Marker key={amb.id} position={[amb.lat, amb.lng]} icon={createAmbulanceIcon(amb.type)}>
                     <Popup>
                       <div style={{ fontWeight: 'bold' }}>{amb.type} Ambulance</div>
                       <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Hospital: {amb.name}</div>
                       <div style={{ fontSize: '12px', color: amb.status === 'Available' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>Status: {amb.status}</div>
                     </Popup>
                  </Marker>
                ))}

                <RecenterMap coords={[userLocation.latitude, userLocation.longitude]} />
              </MapContainer>
             )}
          </div>
        </div>

        {/* Emergency Notifications Section */}
        <div style={{ marginTop: '30px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            EMERGENCY NOTIFICATIONS 🔔
          </h2>
          <button 
            className="btn" 
            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#10b981', color: 'white', fontWeight: '900', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Bell size={20} /> Notify All
          </button>
        </div>

        {/* Privacy & Settings Section */}
        <div style={{ marginTop: '30px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            PRIVACY & SETTINGS 🔒
          </h2>
          <div className="card" style={{ padding: '20px', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '20px' }}>
             <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#065f46' }}>
                  Share Medical History with Paramedics & Hospital
                </span>
             </div>
             <p style={{ fontSize: '11px', color: '#059669', opacity: 0.8, marginBottom: '20px', fontWeight: '600' }}>
               Your data is encrypted and secure, compliant with GDPR/HIPAA standards.
             </p>
             <button 
              onClick={() => navigate('/dashboard')}
              className="btn" 
              style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#10b981', color: 'white', fontWeight: '900', border: 'none' }}
             >
              Cancel Booking
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper components
const LocationPicker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    map.on('click', (e) => {
      onSelect(e.latlng.lat, e.latlng.lng);
    });
  }, [map, onSelect]);
  return null;
};

const ChevronDownIcon = () => (
  <div style={{ color: '#cbd5e1' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </div>
);

const DropletIcon = ({ size, color }: { size: number, color?: string }) => (
  <div style={{ color: color || 'currentColor' }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
    </svg>
  </div>
);

const HospitalIcon = ({ size, color }: { size: number, color?: string }) => (
  <div style={{ color: color || 'currentColor' }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
      <path d="M9 11h6"/>
      <path d="M12 8v6"/>
    </svg>
  </div>
);

export default AmbulanceBookingScreen;
