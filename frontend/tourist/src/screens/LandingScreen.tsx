import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, MapPin, Phone, Users } from 'lucide-react';

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafaf9',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1e293b',
            letterSpacing: '-0.01em'
          }}>
            Suraksha Setu
          </span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#1e293b',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
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
        padding: '40px 24px 60px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '100px',
          background: 'rgba(13, 148, 136, 0.08)',
          color: '#0d9488',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '24px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#0d9488'
          }}></span>
          Trusted by 10,000+ Tourists
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(36px, 6vw, 56px)', 
          fontWeight: '600', 
          color: '#1e293b',
          maxWidth: '720px',
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          marginBottom: '20px'
        }}>
          Travel Safe with
          <br />
          <span style={{ color: '#0d9488' }}>Suraksha Setu</span>
        </h1>
        
        <p style={{ 
          fontSize: '17px', 
          color: '#64748b',
          maxWidth: '520px',
          lineHeight: '1.7',
          marginBottom: '40px'
        }}>
          Your comprehensive safety companion for worry-free travel. Emergency alerts, digital ID, and real-time assistance at your fingertips.
        </p>

        {/* CTA Cards */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          maxWidth: '700px', 
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
              maxWidth: '340px',
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px 28px',
              cursor: 'pointer',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Users size={24} color="white" />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Tourist Access
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#64748b',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Access your digital ID, emergency services, and real-time safety tools designed for travelers.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0d9488',
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
              maxWidth: '340px',
              backgroundColor: '#1e293b',
              borderRadius: '20px',
              padding: '32px 28px',
              cursor: 'pointer',
              border: '1px solid #334155',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Shield size={24} color="white" />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'white',
              marginBottom: '8px'
            }}>
              Admin Portal
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#94a3b8',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Manage security operations, monitor alerts, and oversee tourist safety from the control center.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#5eead4',
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
          marginTop: '60px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { icon: <Phone size={18} />, text: 'Emergency SOS' },
            { icon: <MapPin size={18} />, text: 'Live Tracking' },
            { icon: <Shield size={18} />, text: 'Digital ID' }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569'
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
        padding: '20px 32px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '13px'
      }}>
        Suraksha Setu - Safe Tourism Initiative
      </footer>
    </div>
  );
};

export default LandingScreen;
