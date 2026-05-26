import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  MessageSquare, 
  Navigation,
  User
} from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: <Home size={22} /> },
    { name: 'Emergency', path: '/emergency', icon: <Shield size={22} /> },
    { name: 'Map', path: '/map', icon: <Navigation size={22} /> },
    { name: 'Profile', path: '/profile', icon: <User size={22} /> },
  ];

  return (
    <nav className="bottom-nav" style={{
      display: 'flex',
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '420px',
      height: '72px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
      zIndex: 2000,
      borderRadius: '20px',
      padding: '0 8px',
      justifyContent: 'space-around',
      alignItems: 'center'
    }}>
      {navItems.slice(0, 2).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#0d9488' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: isActive ? '600' : '500',
            gap: '4px',
            flex: 1,
            height: '100%',
            transition: 'color 0.15s ease',
            padding: '8px 4px'
          })}
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}

      {/* Center Chat Button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flex: 1
      }}>
        <button
          onClick={() => navigate('/chat')}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.4)',
            marginTop: '-20px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          title="Suraksha AI"
        >
          <MessageSquare size={24} color="white" />
        </button>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#0d9488',
          marginTop: '6px'
        }}>
          Chat
        </span>
      </div>

      {navItems.slice(2).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#0d9488' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: isActive ? '600' : '500',
            gap: '4px',
            flex: 1,
            height: '100%',
            transition: 'color 0.15s ease',
            padding: '8px 4px'
          })}
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
