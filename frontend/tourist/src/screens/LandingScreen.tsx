import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      paddingBottom: '40px',
      overflow: 'visible',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '1200px', width: '100%', padding: '40px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1e3a8a', fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Join Suraksha Setu</h1>
          <p style={{ color: '#475569', fontSize: '16px' }}>Choose your account type to get started</p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '30px', 
          maxWidth: '1000px', 
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center',
          margin: '0 auto'
        }}>
          
          {/* Tourist Card */}
          <div style={{ 
            flex: '1',
            minWidth: '320px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img 
              src="/assets/tourist_landing.webp" 
              alt="Tourist safety landing section illustration" 
              style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '30px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ color: '#1e3a8a', fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>Register as Tourist</h2>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
                Become part of a trusted network of safe travelers with real-time tracking and emergency tools.
              </p>
              <div style={{ marginTop: 'auto' }}>
                <button 
                  onClick={() => navigate('/login?role=tourist')}
                  style={{ 
                    backgroundColor: '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 40px', 
                    borderRadius: '10px', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3730a3'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div style={{ 
            flex: '1',
            minWidth: '320px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img 
              src="/assets/admin_landing.webp" 
              alt="Admin safety dashboard management illustration" 
              loading="lazy"
              style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '30px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ color: '#1e3a8a', fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>Register as Admin</h2>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
                Access the administrative dashboard to manage security data, alerts, and tourist users.
              </p>
              <div style={{ marginTop: 'auto' }}>
                <button 
                  onClick={() => navigate('/login?role=admin')}
                  style={{ 
                    backgroundColor: '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 40px', 
                    borderRadius: '10px', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3730a3'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
