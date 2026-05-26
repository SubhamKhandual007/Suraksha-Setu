import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  User, 
  LogOut,
  MessageSquare,
  Home,
  FileText,
  CreditCard,
  MapPin,
  QrCode,
  Map,
  Bell,
  BarChart,
  Settings,
  Shield,
  Phone,
  Users
} from 'lucide-react';
import { tokenManager } from '../services/api';
import { refreshAuthStatus } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const userData = tokenManager.getUserData();
  const isAdmin = userData?.role === 'admin';

  const handleLogout = () => {
    tokenManager.removeToken();
    tokenManager.removeUserData();
    refreshAuthStatus();
    navigate('/welcome');
  };

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Tourists', path: '/admin/tourists', icon: <Users size={20} /> },
    { name: 'Live Tracking', path: '/admin/tracking', icon: <MapPin size={20} /> },
    { name: 'SOS Alerts', path: '/admin/sos', icon: <AlertTriangle size={20} /> },
    { name: 'Incidents', path: '/admin/incidents', icon: <FileText size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart size={20} /> },
    { name: 'QR Scanner', path: '/admin/scanner', icon: <QrCode size={20} /> },
    { name: 'Zones', path: '/admin/zones', icon: <Map size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const touristNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Emergency SOS', path: '/emergency', icon: <Phone size={20} /> },
    { name: 'Emergency Directory', path: '/emergency-directory', icon: <FileText size={20} /> },
    { name: 'Suraksha Chat', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Digital ID', path: '/id', icon: <Shield size={20} /> },
    { name: 'Report Incident', path: '/report-incident', icon: <AlertTriangle size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const navItems = isAdmin ? adminNavItems : touristNavItems;

  return (
    <div className="sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0f172a'
    }}>
      {/* Logo Section */}
      <div style={{
        padding: '28px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <div style={{
              fontSize: '17px',
              fontWeight: '600',
              color: 'white',
              letterSpacing: '-0.01em'
            }}>
              Suraksha Setu
            </div>
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              {isAdmin ? 'Admin Portal' : 'Safety Portal'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '10px',
                color: isActive ? 'white' : '#94a3b8',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '500' : '400',
                gap: '12px',
                backgroundColor: isActive ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <span style={{ opacity: 0.9 }}>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {userData?.name || 'User'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>
              {isAdmin ? 'Administrator' : 'Tourist'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: 'none',
            borderRadius: '10px',
            color: '#f87171',
            cursor: 'pointer',
            gap: '12px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.15s ease'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
