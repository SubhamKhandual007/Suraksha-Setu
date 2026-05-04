import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  AlertTriangle, 
  History, 
  User, 
  LogOut,
  ShieldCheck,
  MessageSquare,
  Home,
  Droplet,
  FlaskConical,
  HeartPulse,
  CreditCard,
  MapPin,
  QrCode,
  Map,
  FileText,
  Bell,
  BarChart,
  Settings
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

  const navItems = isAdmin ? [
    { name: 'Dashboard',         path: '/admin/dashboard',  icon: <LayoutDashboard size={20} /> },
    { name: 'Tourists',          path: '/admin/tourists',   icon: <User size={20} /> },
    { name: 'Live Tracking',     path: '/admin/tracking',   icon: <MapPin size={20} /> },
    { name: 'SOS Alerts',        path: '/admin/sos',        icon: <AlertTriangle size={20} /> },
    { name: 'Incident Reports',  path: '/admin/incidents',  icon: <FileText size={20} /> },
    { name: 'Weekly Reports',    path: '/admin/reports',    icon: <History size={20} /> },
    { name: 'QR Scanner',        path: '/admin/scanner',    icon: <QrCode size={20} /> },
    { name: 'Zone Management',   path: '/admin/zones',      icon: <Map size={20} /> },
    { name: 'Notifications',     path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Analytics',         path: '/admin/analytics',  icon: <BarChart size={20} /> },
    { name: 'Settings',          path: '/admin/settings',   icon: <Settings size={20} /> },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Emergency', path: '/emergency', icon: <Droplet size={20} /> },
    { name: 'Emergency Directory', path: '/emergency-directory', icon: <FileText size={20} /> },
    { name: 'Suraksha Chat', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Digital ID', path: '/id', icon: <FlaskConical size={20} /> },
    { name: 'Report Incident', path: '/report-incident', icon: <AlertTriangle size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <HeartPulse size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1px' }}>Suraksha Setu</h2>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>SAFE TOURISM PORTAL</div>
      </div>

      <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', height: 'calc(100% - 150px)' }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '15px 30px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              gap: '15px',
              backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
              transition: 'all 0.2s'
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', padding: '20px 30px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#fff', 
              color: '#1a237e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              overflow: 'hidden'
            }}>
              {isAdmin ? (
                <img 
                  src="/assets/admin_photo.png" 
                  alt="Admin Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to initial if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = userData?.name?.charAt(0) || 'U';
                  }}
                />
              ) : (
                userData?.name?.charAt(0) || 'U'
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userData?.name}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{userData?.role?.toUpperCase()}</div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              gap: '10px',
              fontSize: '14px'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
