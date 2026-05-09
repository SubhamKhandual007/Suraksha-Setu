import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Shield, CheckCircle, User, Mail, Phone, Calendar, Globe, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';

const VerificationScreen: React.FC = () => {
  const { digitalId } = useParams<{ digitalId: string }>();
  const [tourist, setTourist] = useState<any>(null);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Using the public verification endpoint
        const response = await axios.get(`${API_BASE_URL}/api/verify/${digitalId}`);
        if (response.data.success) {
          setTourist(response.data.tourist);
          setAlert(response.data.alert);
        } else {
          setError(response.data.message || 'Verification failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to verify Digital ID');
      } finally {
        setLoading(false);
      }
    };

    if (digitalId) {
      fetchDetails();
    }
  }, [digitalId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Verifying Identity...</p>
      </div>
    );
  }

  if (error || !tourist) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '50%' }}>
          <AlertTriangle size={48} color="var(--danger)" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--dark)' }}>Verification Failed</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>{error || 'The Digital ID provided is invalid or has been revoked.'}</p>
        <button onClick={() => navigate('/welcome')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={18} />
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header Status */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {tourist.status === 'SAFE' ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '10px 20px', borderRadius: '40px', marginBottom: '15px' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status: Safe</span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: 'var(--danger)', padding: '10px 20px', borderRadius: '40px', marginBottom: '15px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status: EMERGENCY</span>
          </div>
        )}
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--dark)', margin: 0 }}>Tourist Profile</h1>

        <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Official Suraksha Setu Verification Portal</p>
      </div>

      {/* Main Profile Card */}
      <div className="card" style={{ padding: '30px', marginBottom: '30px', background: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'var(--premium-gradient)' }}></div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #eef2ff', marginBottom: '15px' }}>
            <User size={50} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{tourist.name}</h2>
          <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginTop: '4px' }}>ID: {tourist.digitalId}</div>
        </div>

        {alert && (
          <div style={{ 
            background: '#fff1f2', 
            border: '1px solid #fda4af', 
            borderRadius: '16px', 
            padding: '15px', 
            marginBottom: '25px',
            display: 'flex',
            gap: '12px'
          }}>
            <div style={{ color: '#e11d48' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#9f1239', fontSize: '14px' }}>ACTIVE EMERGENCY ALERT</div>
              <div style={{ fontSize: '13px', color: '#be123c', marginTop: '2px' }}>{alert.message}</div>
              <div style={{ fontSize: '11px', color: '#fb7185', marginTop: '5px', fontWeight: '600' }}>
                Triggered: {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#eef2ff', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{tourist.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px', color: '#16a34a' }}>
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{tourist.phone}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '12px', color: '#ea580c' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Last Known Location</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{tourist.location.city} ({tourist.location.latitude.toFixed(4)}, {tourist.location.longitude.toFixed(4)})</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Emergency Contact</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{tourist.emergencyContact || 'Not Specified'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b' }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Registration Date</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{new Date(tourist.registrationTimestamp).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
        <Shield size={24} color="#64748b" style={{ marginBottom: '10px' }} />
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          This data is retrieved from official records. For security reasons, location tracking is active for verified tourist profiles.
        </p>
      </div>
    </div>
  );
};

export default VerificationScreen;
