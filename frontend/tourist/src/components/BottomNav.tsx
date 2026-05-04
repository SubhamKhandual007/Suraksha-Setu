import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shield, MapPin, AlertCircle, User as UserIcon } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <div className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      
      <NavLink to="/id" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Shield size={24} />
        <span>Digital ID</span>
      </NavLink>

      <NavLink to="/emergency" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ backgroundColor: 'var(--danger)', borderRadius: '50%', padding: '12px', marginTop: '-20px', color: 'white', boxShadow: '0 4px 10px rgba(220, 53, 69, 0.4)' }}>
          <AlertCircle size={28} />
        </div>
        <span style={{ marginTop: '8px', color: 'var(--danger)', fontWeight: 'bold' }}>SOS</span>
      </NavLink>
      
      <NavLink to="/location" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MapPin size={24} />
        <span>Location</span>
      </NavLink>
      
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <UserIcon size={24} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
