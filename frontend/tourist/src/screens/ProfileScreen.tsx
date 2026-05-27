import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Globe, Shield, PhoneCall, LogOut, Settings, Bell, ShieldCheck } from 'lucide-react';
import { tokenManager } from '../services/api';
import { refreshAuthStatus } from '../hooks/useAuth';

import profilePic from '../assets/user_profile.webp';

const ProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = tokenManager.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  const handleLogout = () => {
    tokenManager.removeToken();
    tokenManager.removeUserData();
    refreshAuthStatus();
    navigate('/login');
  };

  if (!userData) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '4px solid white'
          }}>
            <img 
              src={profilePic} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ 
            position: 'absolute', 
            bottom: '5px', 
            right: '5px', 
            background: 'var(--success)', 
            color: 'white', 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '3px solid white',
            zIndex: 2
          }}>
            <ShieldCheck size={14} />
          </div>
        </div>
        <h1 className="screen-title" style={{ marginBottom: '4px' }}>{userData.name}</h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tourist ID: {userData.digitalId}</p>
      </header>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: 'var(--primary)', background: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
            <Mail size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{userData.email}</div>
          </div>
        </div>

        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: 'var(--info)', background: '#e0f2fe', padding: '10px', borderRadius: '12px' }}>
            <Phone size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{userData.phone}</div>
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: 'var(--success)', background: '#ecfdf5', padding: '10px', borderRadius: '12px' }}>
            <Globe size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Country</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{userData.country || 'Not Set'}</div>
          </div>
        </div>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--dark)' }}>Emergency Contacts</h3>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: 'var(--danger)', background: '#fef2f2', padding: '12px', borderRadius: '50%' }}>
              <PhoneCall size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>
                {userData.emergencyContacts && userData.emergencyContacts.length > 0 
                  ? userData.emergencyContacts[0].name 
                  : (userData.emergencyContactName || 'Primary Contact')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {userData.emergencyContacts && userData.emergencyContacts.length > 0 
                  ? userData.emergencyContacts[0].phone 
                  : (userData.emergencyContact || 'No contact added')}
              </div>
            </div>
            <button className="btn" style={{ padding: '10px', borderRadius: '10px', background: 'var(--light)' }}>
              <Settings size={18} color="var(--text-secondary)" />
            </button>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--dark)' }}>System Settings</h3>
        <div className="card" style={{ padding: '0' }}>
          <button style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', textAlign: 'left' }}>
            <Bell size={20} color="var(--text-secondary)" />
            <span style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>Notification Preferences</span>
          </button>
          <button style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', textAlign: 'left' }}>
            <Shield size={20} color="var(--text-secondary)" />
            <span style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>Privacy & Security</span>
          </button>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
          >
            <LogOut size={20} />
            <span style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}>Logout from Suraksha Setu</span>
          </button>
        </div>
      </section>

      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        App Version 2.4.0 (Stable) • Secured by Suraksha Setu Network
      </p>
    </div>
  );
};

export default ProfileScreen;
