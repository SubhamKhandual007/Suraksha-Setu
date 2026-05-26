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
  Phone,
  ArrowUpRight
} from 'lucide-react';

import { tokenManager } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      borderRadius: '14px',
      border: '1px solid #262626',
      background: '#171717',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minHeight: '100px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#404040';
      e.currentTarget.style.background = '#1f1f1f';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#262626';
      e.currentTarget.style.background = '#171717';
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
      color: '#0a0a0a'
    }}>
      {icon}
    </div>
    <span style={{
      fontSize: '13px',
      fontWeight: '500',
      color: '#fafafa',
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
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, subtitle, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: '#171717',
      borderRadius: '14px',
      cursor: 'pointer',
      border: '1px solid #262626',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#404040';
      e.currentTarget.style.background = '#1f1f1f';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#262626';
      e.currentTarget.style.background = '#171717';
    }}
  >
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: '#262626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a3a3a3',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '15px',
        fontWeight: '500',
        color: '#fafafa',
        marginBottom: '2px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#737373'
      }}>
        {subtitle}
      </div>
    </div>
    <ChevronRight size={18} color="#525252" />
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
          marginBottom: '32px'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: '#737373', marginBottom: '4px' }}>
              {getGreeting()}
            </p>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '500',
              color: '#fafafa',
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
              background: '#171717',
              border: '1px solid #262626',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a3a3a3'
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
                border: '2px solid #171717'
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
                background: '#c9a87c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0a0a0a',
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
            onClick={() => navigate('/emergency')}
          />
          <QuickAction
            icon={<UserCircle size={22} />}
            label="Digital ID"
            color="#c9a87c"
            onClick={() => navigate('/id')}
          />
          <QuickAction
            icon={<Navigation size={22} />}
            label="Safety Map"
            color="#3b82f6"
            onClick={() => navigate('/map')}
          />
        </div>

        {/* AI Assistant Card */}
        <div
          onClick={() => navigate('/chat')}
          style={{
            background: '#c9a87c',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(10, 10, 10, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={22} color="#0a0a0a" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#0a0a0a',
              marginBottom: '4px'
            }}>
              Suraksha AI Assistant
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(10, 10, 10, 0.7)'
            }}>
              Get instant safety guidance and support
            </div>
          </div>
          <ArrowUpRight size={20} color="#0a0a0a" />
        </div>

        {/* Community Card */}
        <div
          onClick={() => navigate('/community-chat')}
          style={{
            background: '#171717',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            marginBottom: '28px',
            border: '1px solid #262626'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#262626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} color="#a3a3a3" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#fafafa',
              marginBottom: '4px'
            }}>
              Tourist Community
            </div>
            <div style={{
              fontSize: '13px',
              color: '#737373'
            }}>
              Connect with fellow travelers
            </div>
          </div>
          <ChevronRight size={20} color="#525252" />
        </div>

        {/* Services Section */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#737373',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Emergency Services
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ServiceCard
              icon={<Ambulance size={20} />}
              title="Ambulance Service"
              subtitle="Emergency medical transport"
              onClick={() => navigate('/ambulance')}
            />
            <ServiceCard
              icon={<Hospital size={20} />}
              title="Nearby Hospitals"
              subtitle="Find medical facilities"
              onClick={() => navigate('/map', { state: { filter: 'hospital' } })}
            />
            <ServiceCard
              icon={<Shield size={20} />}
              title="Police Stations"
              subtitle="Emergency assistance"
              onClick={() => navigate('/map', { state: { filter: 'police' } })}
            />
          </div>
        </div>

        {/* Other Services */}
        <div>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#737373',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Other Services
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ServiceCard
              icon={<Hotel size={20} />}
              title="Nearby Hotels"
              subtitle="Find accommodation"
              onClick={() => navigate('/hotels')}
            />
            <ServiceCard
              icon={<CreditCard size={20} />}
              title="Payment History"
              subtitle="View transactions"
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
        background: '#171717',
        borderRadius: '16px',
        padding: '28px',
        color: '#fafafa',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #262626'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#c9a87c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={26} color="#0a0a0a" />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '500',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                Suraksha Setu
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#737373',
                margin: '4px 0 0'
              }}>
                Welcome, <span style={{ color: '#c9a87c', fontWeight: '500' }}>{userData?.name || 'Traveler'}</span>
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#525252',
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
          fontSize: '14px',
          fontWeight: '500',
          color: '#737373',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Quick Access
        </h2>
        <button
          onClick={() => navigate('/dashboard/detailed')}
          style={{
            fontSize: '14px',
            color: '#c9a87c',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {[
          {
            icon: <ShieldAlert size={20} />,
            title: 'Emergency SOS',
            subtitle: 'Quick alert',
            accent: '#ef4444',
            path: '/emergency'
          },
          {
            icon: <UserCircle size={20} />,
            title: 'Digital ID',
            subtitle: 'Your credentials',
            accent: '#c9a87c',
            path: '/id'
          },
          {
            icon: <MapIcon size={20} />,
            title: 'Safety Map',
            subtitle: 'Zone tracking',
            accent: '#3b82f6',
            path: '/map'
          },
          {
            icon: <MessageSquare size={20} />,
            title: 'AI Assistant',
            subtitle: 'Get help',
            accent: '#a855f7',
            path: '/chat'
          },
          {
            icon: <Hospital size={20} />,
            title: 'Hospitals',
            subtitle: 'Find nearby',
            accent: '#22c55e',
            path: '/map',
            state: { filter: 'hospital' }
          },
          {
            icon: <Shield size={20} />,
            title: 'Police',
            subtitle: 'Emergency help',
            accent: '#737373',
            path: '/map',
            state: { filter: 'police' }
          },
          {
            icon: <Ambulance size={20} />,
            title: 'Ambulance',
            subtitle: 'Medical transport',
            accent: '#f59e0b',
            path: '/ambulance'
          },
          {
            icon: <Hotel size={20} />,
            title: 'Hotels',
            subtitle: 'Accommodation',
            accent: '#06b6d4',
            path: '/hotels'
          },
          {
            icon: <Users size={20} />,
            title: 'Community',
            subtitle: 'Connect',
            accent: '#ec4899',
            path: '/community-chat'
          },
          {
            icon: <User size={20} />,
            title: 'Profile',
            subtitle: 'Your account',
            accent: '#737373',
            path: '/profile'
          },
          {
            icon: <FileText size={20} />,
            title: 'Report Incident',
            subtitle: 'File report',
            accent: '#ef4444',
            path: '/report-incident'
          },
          {
            icon: <CreditCard size={20} />,
            title: 'Payments',
            subtitle: 'View history',
            accent: '#a855f7',
            path: '/payments'
          }
        ].map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
            style={{
              background: '#171717',
              borderRadius: '14px',
              padding: '20px 16px',
              cursor: 'pointer',
              border: '1px solid #262626',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#404040';
              e.currentTarget.style.background = '#1f1f1f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#262626';
              e.currentTarget.style.background = '#171717';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#262626',
              color: item.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              {item.icon}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#fafafa',
              marginBottom: '2px'
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#525252'
            }}>
              {item.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contact Banner */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Phone size={20} color="#fafafa" />
        </div>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#ef4444',
            marginBottom: '4px'
          }}>
            Emergency Helpline
          </div>
          <div style={{
            fontSize: '13px',
            color: '#a3a3a3'
          }}>
            Call 112 for immediate assistance
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
