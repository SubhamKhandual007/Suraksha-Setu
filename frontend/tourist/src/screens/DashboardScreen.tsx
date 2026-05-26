import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Map as MapIcon, 
  UserCircle, 
  ChevronRight,
  User,
  Bell,
  ShieldAlert,
  Navigation,
  MessageSquare,
  Ambulance,
  Hospital,
  Hotel,
  CreditCard,
  Users,
  FileText,
  Phone
} from 'lucide-react';

import { tokenManager } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, bgColor, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      borderRadius: '16px',
      border: 'none',
      background: bgColor,
      cursor: 'pointer',
      transition: 'all 0.2s',
      minHeight: '100px'
    }}
  >
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '10px',
      color: 'white'
    }}>
      {icon}
    </div>
    <span style={{
      fontSize: '13px',
      fontWeight: '500',
      color: '#1e293b',
      textAlign: 'center'
    }}>
      {label}
    </span>
  </button>
);

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, subtitle, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'white',
      borderRadius: '14px',
      cursor: 'pointer',
      border: '1px solid #f1f5f9',
      transition: 'all 0.2s'
    }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '15px',
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: '2px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#64748b'
      }}>
        {subtitle}
      </div>
    </div>
    <ChevronRight size={18} color="#94a3b8" />
  </div>
);

const DashboardScreen: React.FC<{ mode?: 'grid' | 'detailed' }> = ({ mode = 'grid' }) => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = tokenManager.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (mode === 'detailed') {
    return (
      <div className="fade-in" style={{ paddingBottom: '20px' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
              {getGreeting()}
            </p>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              letterSpacing: '-0.02em'
            }}>
              {userData?.name || 'Traveler'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}>
              <Bell size={20} />
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            </button>
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {userData?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '28px'
        }} className="responsive-grid-1">
          <QuickAction
            icon={<ShieldAlert size={22} />}
            label="Emergency SOS"
            color="#ef4444"
            bgColor="#fef2f2"
            onClick={() => navigate('/emergency')}
          />
          <QuickAction
            icon={<UserCircle size={22} />}
            label="Digital ID"
            color="#0d9488"
            bgColor="#f0fdfa"
            onClick={() => navigate('/id')}
          />
          <QuickAction
            icon={<Navigation size={22} />}
            label="Safety Map"
            color="#0ea5e9"
            bgColor="#f0f9ff"
            onClick={() => navigate('/map')}
          />
        </div>

        {/* AI Assistant Card */}
        <div
          onClick={() => navigate('/chat')}
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '4px'
            }}>
              Suraksha AI Assistant
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              Get instant safety guidance and support
            </div>
          </div>
          <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
        </div>

        {/* Community Card */}
        <div
          onClick={() => navigate('/community-chat')}
          style={{
            background: '#1e293b',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            marginBottom: '28px'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '4px'
            }}>
              Tourist Community
            </div>
            <div style={{
              fontSize: '13px',
              color: '#94a3b8'
            }}>
              Connect with fellow travelers
            </div>
          </div>
          <ChevronRight size={20} color="#94a3b8" />
        </div>

        {/* Services Section */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            Emergency Services
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ServiceCard
              icon={<Ambulance size={22} />}
              title="Ambulance Service"
              subtitle="Emergency medical transport"
              color="#f59e0b"
              onClick={() => navigate('/ambulance')}
            />
            <ServiceCard
              icon={<Hospital size={22} />}
              title="Nearby Hospitals"
              subtitle="Find medical facilities"
              color="#0ea5e9"
              onClick={() => navigate('/map', { state: { filter: 'hospital' } })}
            />
            <ServiceCard
              icon={<Shield size={22} />}
              title="Police Stations"
              subtitle="Emergency assistance"
              color="#1e293b"
              onClick={() => navigate('/map', { state: { filter: 'police' } })}
            />
          </div>
        </div>

        {/* Other Services */}
        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            Other Services
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ServiceCard
              icon={<Hotel size={22} />}
              title="Nearby Hotels"
              subtitle="Find accommodation"
              color="#10b981"
              onClick={() => navigate('/hotels')}
            />
            <ServiceCard
              icon={<CreditCard size={22} />}
              title="Payment History"
              subtitle="View transactions"
              color="#8b5cf6"
              onClick={() => navigate('/payments')}
            />
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Grid Mode (Default Dashboard)
  return (
    <div className="fade-in" style={{ paddingBottom: '20px' }}>
      {/* Welcome Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '20px',
        padding: '28px',
        color: 'white',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          right: '40px',
          width: '120px',
          height: '120px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={28} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                Suraksha Setu
              </h2>
              <p style={{
                fontSize: '14px',
                opacity: 0.7,
                margin: '4px 0 0'
              }}>
                Welcome, <span style={{ color: '#5eead4', fontWeight: '500' }}>{userData?.name || 'Traveler'}</span>
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '13px',
            opacity: 0.6,
            margin: 0
          }}>
            Your personal safety companion for worry-free travel
          </p>
        </div>
      </section>

      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b'
        }}>
          Quick Access
        </h2>
        <button
          onClick={() => navigate('/dashboard/detailed')}
          style={{
            fontSize: '14px',
            color: '#0d9488',
            fontWeight: '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          View All
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Feature Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {[
          {
            icon: <ShieldAlert size={22} />,
            title: 'Emergency SOS',
            subtitle: 'Quick alert',
            color: '#ef4444',
            bg: '#fef2f2',
            path: '/emergency'
          },
          {
            icon: <UserCircle size={22} />,
            title: 'Digital ID',
            subtitle: 'Your credentials',
            color: '#0d9488',
            bg: '#f0fdfa',
            path: '/id'
          },
          {
            icon: <MapIcon size={22} />,
            title: 'Safety Map',
            subtitle: 'Zone tracking',
            color: '#0ea5e9',
            bg: '#f0f9ff',
            path: '/map'
          },
          {
            icon: <MessageSquare size={22} />,
            title: 'AI Assistant',
            subtitle: 'Get help',
            color: '#8b5cf6',
            bg: '#f5f3ff',
            path: '/chat'
          },
          {
            icon: <Hospital size={22} />,
            title: 'Hospitals',
            subtitle: 'Find nearby',
            color: '#0ea5e9',
            bg: '#f0f9ff',
            path: '/map',
            state: { filter: 'hospital' }
          },
          {
            icon: <Shield size={22} />,
            title: 'Police',
            subtitle: 'Emergency help',
            color: '#1e293b',
            bg: '#f8fafc',
            path: '/map',
            state: { filter: 'police' }
          },
          {
            icon: <Ambulance size={22} />,
            title: 'Ambulance',
            subtitle: 'Medical transport',
            color: '#f59e0b',
            bg: '#fffbeb',
            path: '/ambulance'
          },
          {
            icon: <Hotel size={22} />,
            title: 'Hotels',
            subtitle: 'Accommodation',
            color: '#10b981',
            bg: '#ecfdf5',
            path: '/hotels'
          },
          {
            icon: <Users size={22} />,
            title: 'Community',
            subtitle: 'Connect',
            color: '#6366f1',
            bg: '#eef2ff',
            path: '/community-chat'
          },
          {
            icon: <User size={22} />,
            title: 'Profile',
            subtitle: 'Your account',
            color: '#64748b',
            bg: '#f8fafc',
            path: '/profile'
          },
          {
            icon: <FileText size={22} />,
            title: 'Report Incident',
            subtitle: 'File report',
            color: '#f43f5e',
            bg: '#fff1f2',
            path: '/report-incident'
          },
          {
            icon: <CreditCard size={22} />,
            title: 'Payments',
            subtitle: 'View history',
            color: '#8b5cf6',
            bg: '#f5f3ff',
            path: '/payments'
          }
        ].map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px 16px',
              cursor: 'pointer',
              border: '1px solid #f1f5f9',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: item.bg,
              color: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              {item.icon}
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#1e293b',
              marginBottom: '2px'
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              {item.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contact Banner */}
      <div style={{
        background: '#fef2f2',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid #fecaca'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Phone size={22} color="white" />
        </div>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#dc2626',
            marginBottom: '4px'
          }}>
            Emergency Helpline
          </div>
          <div style={{
            fontSize: '13px',
            color: '#b91c1c'
          }}>
            Call 112 for immediate assistance
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
