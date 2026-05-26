import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, MapPin, Phone, Fingerprint } from 'lucide-react';

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      color: '#fafafa'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#fafafa',
            letterSpacing: '-0.01em'
          }}>
            Suraksha Setu
          </span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            borderRadius: '100px',
            border: '1px solid #262626',
            background: 'transparent',
            color: '#fafafa',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#171717';
            e.currentTarget.style.borderColor = '#404040';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#262626';
          }}
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 80px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: '#171717',
          border: '1px solid #262626',
          color: '#a3a3a3',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '32px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e'
          }}></span>
          Trusted by 10,000+ Travelers
        </div>
        
        {/* Hero Title */}
        <h1 style={{ 
          fontSize: 'clamp(40px, 8vw, 72px)', 
          fontWeight: '500', 
          color: '#fafafa',
          maxWidth: '800px',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
          marginBottom: '24px'
        }}>
          Safety at every step
        </h1>
        
        <p style={{ 
          fontSize: '17px', 
          color: '#737373',
          maxWidth: '480px',
          lineHeight: '1.7',
          marginBottom: '48px'
        }}>
          Your comprehensive safety companion for worry-free travel. Emergency alerts, digital ID, and real-time assistance.
        </p>

        {/* CTA Cards */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          maxWidth: '680px', 
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* Tourist Card */}
          <div 
            onClick={() => navigate('/login?role=tourist')}
            style={{ 
              flex: '1',
              minWidth: '280px',
              maxWidth: '320px',
              backgroundColor: '#171717',
              borderRadius: '16px',
              padding: '28px 24px',
              cursor: 'pointer',
              border: '1px solid #262626',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c9a87c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#262626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#c9a87c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Fingerprint size={22} color="#0a0a0a" />
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              color: '#fafafa',
              marginBottom: '8px'
            }}>
              Tourist Access
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#737373',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Access your digital ID, emergency services, and real-time safety tools.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#c9a87c',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Get Started
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => navigate('/login?role=admin')}
            style={{ 
              flex: '1',
              minWidth: '280px',
              maxWidth: '320px',
              backgroundColor: '#c9a87c',
              borderRadius: '16px',
              padding: '28px 24px',
              cursor: 'pointer',
              border: '1px solid #c9a87c',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(201, 168, 124, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(10, 10, 10, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Shield size={22} color="#0a0a0a" />
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              color: '#0a0a0a',
              marginBottom: '8px'
            }}>
              Admin Portal
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'rgba(10, 10, 10, 0.7)',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Manage security operations and monitor tourist safety systems.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0a0a0a',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Admin Access
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div style={{
          display: 'flex',
          gap: '32px',
          marginTop: '64px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { icon: <Phone size={16} />, text: 'Emergency SOS' },
            { icon: <MapPin size={16} />, text: 'Live Tracking' },
            { icon: <Fingerprint size={16} />, text: 'Digital ID' }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#525252',
              fontSize: '14px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#171717',
                border: '1px solid #262626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#737373'
              }}>
                {feature.icon}
              </div>
              {feature.text}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px 24px',
        textAlign: 'center',
        color: '#525252',
        fontSize: '13px',
        borderTop: '1px solid #171717'
      }}>
        Suraksha Setu - Safe Tourism Initiative
      </footer>
    </div>
  );
};

export default LandingScreen;
