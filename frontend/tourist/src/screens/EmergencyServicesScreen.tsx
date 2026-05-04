import React, { useState, useEffect } from 'react';
import { 
  Hospital, 
  Shield, 
  Ambulance as AmbulanceIcon, 
  Phone, 
  Navigation, 
  Activity,
  AlertCircle,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { directoryService, DirectoryEntry } from '../services/directoryService';

const EmergencyServicesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'hospital' | 'police'>('all');
  const [services, setServices] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    setServices(directoryService.getAll());
  }, []);

  const hospitals = services.filter(s => s.type === 'hospital');
  const policeStations = services.filter(s => s.type === 'police');

  const ServiceCard = ({ service }: { service: DirectoryEntry }) => (
    <div className="card" style={{ 
      padding: '16px', 
      marginBottom: '12px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e293b' }}>{service.name}</h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>{service.distance} away</p>
        </div>
        <div style={{ 
          padding: '4px 8px', 
          borderRadius: '20px', 
          fontSize: '10px', 
          fontWeight: '700',
          backgroundColor: service.status === 'Available' ? '#f0fdf4' : '#fff7ed',
          color: service.status === 'Available' ? '#16a34a' : '#ea580c',
          border: `1px solid ${service.status === 'Available' ? '#bbf7d0' : '#ffedd5'}`
        }}>
          {service.status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => window.location.href = `tel:${service.phone}`}
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '8px', 
            border: 'none', 
            background: '#f1f5f9', 
            color: '#1e293b',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Phone size={16} /> {service.type === 'police' ? 'Call Police' : 'Emergency Call'}
        </button>
        <button 
          onClick={() => navigate('/map', { state: { lat: 20.2961, lng: 85.8245 } })} // Mock destination
          style={{ 
            padding: '10px 16px', 
            borderRadius: '8px', 
            border: 'none', 
            background: 'var(--primary)', 
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Navigation size={16} /> Navigate
        </button>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Emergency Directory</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Bhubaneswar Smart Safety Network</p>
      </header>

      {/* Quick Help Summary Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        borderRadius: '20px', 
        padding: '20px', 
        color: 'white', 
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertCircle size={20} color="#60a5fa" />
          <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Quick Emergency Help</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <Hospital size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: '10px', opacity: 0.7 }}>Nearest Hospital</div>
            <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>AIIMS (1.2km)</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <Shield size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: '10px', opacity: 0.7 }}>Police Support</div>
            <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>Khandagiri (0.8km)</div>
          </div>
        </div>
      </section>



      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ 
            padding: '8px 16px', borderRadius: '20px', border: 'none', 
            background: activeTab === 'all' ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'all' ? 'white' : '#64748b',
            fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
          }}
        >
          All Services
        </button>
        <button 
          onClick={() => setActiveTab('hospital')}
          style={{ 
            padding: '8px 16px', borderRadius: '20px', border: 'none', 
            background: activeTab === 'hospital' ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'hospital' ? 'white' : '#64748b',
            fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
          }}
        >
          Hospitals
        </button>
        <button 
          onClick={() => setActiveTab('police')}
          style={{ 
            padding: '8px 16px', borderRadius: '20px', border: 'none', 
            background: activeTab === 'police' ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'police' ? 'white' : '#64748b',
            fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
          }}
        >
          Police Stations
        </button>
      </div>

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(activeTab === 'all' || activeTab === 'hospital') && (
          <div style={{ marginBottom: '20px' }}>
            {activeTab === 'all' && (
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Hospitals
              </h3>
            )}
            {hospitals.map(h => <ServiceCard key={h.id} service={h} />)}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'police') && (
          <div style={{ marginBottom: '20px' }}>
            {activeTab === 'all' && (
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Police Stations
              </h3>
            )}
            {policeStations.map(p => <ServiceCard key={p.id} service={p} />)}
            <button 
              onClick={() => navigate('/map', { state: { filter: 'police' } })}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', border: '2px dashed #cbd5e1', 
                background: 'transparent', color: '#64748b', fontWeight: '700', fontSize: '14px',
                marginTop: '8px'
              }}
            >
              <MapPin size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> 
              Find Nearest Police Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyServicesScreen;
