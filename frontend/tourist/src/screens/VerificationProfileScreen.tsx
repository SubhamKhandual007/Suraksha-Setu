import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, User, MapPin, Calendar, CheckCircle, AlertTriangle, Phone, Mail, Globe } from 'lucide-react';
import { authAPI } from '../services/api';

const VerificationProfileScreen: React.FC = () => {
  const { digitalId } = useParams<{ digitalId: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyId = async () => {
      if (!digitalId) return;
      try {
        const response = await authAPI.verifyDigitalId(digitalId);
        if (response.success) {
          setUserData(response.user);
        } else {
          setError(response.message || 'Verification failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Digital ID not found or invalid');
      } finally {
        setLoading(false);
      }
    };

    verifyId();
  }, [digitalId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <div className="spinner" style={{ marginBottom: '20px' }}></div>
        <div style={{ fontWeight: '700', color: '#64748b' }}>Verifying Digital ID...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', background: '#f8fafc' }}>
        <div style={{ background: '#fee2e2', color: '#ef4444', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
          <AlertTriangle size={48} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px', color: '#1e293b' }}>Invalid Digital ID</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '12px 30px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', marginBottom: '15px' }}>
            <CheckCircle size={16} /> VERIFIED TOURIST
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Safety Profile</h1>
        </header>

        {/* Profile Card */}
        <div className="card" style={{ padding: '30px', borderRadius: '24px', textAlign: 'center', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--premium-gradient)', padding: '4px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={50} color="#cbd5e1" />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#10b981', color: 'white', padding: '4px', borderRadius: '50%', border: '3px solid white' }}>
              <Shield size={14} />
            </div>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 5px 0', color: '#1e293b' }}>{userData.name}</h2>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>ID: {userData.digitalId}</div>
        </div>

        {/* Details Section */}
        <div className="card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
              <Globe size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Status</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Active / Verified</div>
            </div>
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '12px' }}>
              <Phone size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Contact Number</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{userData.phone}</div>
            </div>
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#f0fdf4', color: '#10b981', padding: '10px', borderRadius: '12px' }}>
              <Mail size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{userData.email}</div>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#f1f5f9', color: '#64748b', padding: '10px', borderRadius: '12px' }}>
              <Calendar size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Registered On</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{new Date(userData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
            This profile is part of the Smart Tourist Safety System.<br />
            Data is securely verified by local authorities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationProfileScreen;
