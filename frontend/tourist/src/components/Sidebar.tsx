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
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Tourists', path: '/admin/tourists', icon: <Users size={18} /> },
    { name: 'Live Tracking', path: '/admin/tracking', icon: <MapPin size={18} /> },
    { name: 'SOS Alerts', path: '/admin/sos', icon: <AlertTriangle size={18} /> },
    { name: 'Incidents', path: '/admin/incidents', icon: <FileText size={18} /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart size={18} /> },
    { name: 'QR Scanner', path: '/admin/scanner', icon: <QrCode size={18} /> },
    { name: 'Zones', path: '/admin/zones', icon: <Map size={18} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={18} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  const touristNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Emergency SOS', path: '/emergency', icon: <Phone size={18} /> },
    { name: 'Emergency Directory', path: '/emergency-directory', icon: <FileText size={18} /> },
    { name: 'Suraksha Chat', path: '/chat', icon: <MessageSquare size={18} /> },
    { name: 'Digital ID', path: '/id', icon: <Shield size={18} /> },
    { name: 'Report Incident', path: '/report-incident', icon: <AlertTriangle size={18} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  const navItems = isAdmin ? adminNavItems : touristNavItems;

  return (
    <div className="sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0a0a',
      borderRight: '1px solid #262626'
    }}>
      {/* Logo Section */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #1f1f1f'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#c9a87c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={20} color="#0a0a0a" />
          </div>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#fafafa',
              letterSpacing: '-0.01em'
            }}>
              Suraksha Setu
            </div>
            <div style={{
              fontSize: '11px',
              color: '#525252',
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
          gap: '2px'
        }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? '#fafafa' : '#737373',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '500' : '400',
                gap: '12px',
                backgroundColor: isActive ? '#1f1f1f' : 'transparent',
                transition: 'all 0.15s ease',
                border: isActive ? '1px solid #262626' : '1px solid transparent'
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
        padding: '16px 12px',
        borderTop: '1px solid #1f1f1f'
      }}>
        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: '#171717',
          borderRadius: '10px',
          marginBottom: '12px',
          border: '1px solid #262626'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#c9a87c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0a0a0a',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#fafafa',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {userData?.name || 'User'}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#525252'
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
            padding: '10px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            gap: '12px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
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
