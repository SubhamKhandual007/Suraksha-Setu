import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, ShieldAlert, HeartPulse } from 'lucide-react';
import { locationService } from '../services/locationService';
import socketService from '../services/socketService';
import { emergencyContactService } from '../services/emergencyContactService';
import { tokenManager, emergencyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EmergencyAlertScreen: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [alertError, setAlertError] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [audio] = useState(new Audio('/assets/sos-siren.mp3'));

  useEffect(() => {
    // Loop the siren if it's playing
    audio.loop = true;
    audio.volume = 1.0;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useEffect(() => {
    // Get location immediately when screen opens
    locationService.getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(err => console.error("Could not get location for emergency:", err));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      sendEmergencyAlert();
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const initiateAlert = () => {
    if (alertSent) return;
    setAlertError('');
    setCountdown(5);
    audio.play().catch(e => console.error("Error playing audio:", e));
  };

  const cancelAlert = () => {
    setCountdown(null);
    audio.pause();
    audio.currentTime = 0;
  };

  const sendEmergencyAlert = async () => {
    setAlertSent(true);
    audio.pause();
    audio.currentTime = 0;

    // Ensure we have a location
    const currentLoc = location || await locationService.getCurrentLocation().catch(() => ({
      latitude: 28.6139, // Default: New Delhi
      longitude: 77.2090,
      accuracy: 100
    }));

    try {
      // PRIMARY: Call REST API — saves to DB, logs activity, broadcasts to all admin sockets
      await emergencyAPI.sendAlert({
        type: 'panic',
        location: {
          latitude: currentLoc.latitude,
          longitude: currentLoc.longitude,
        },
        message: 'User triggered panic button'
      });

      console.log('✅ SOS alert saved to database and broadcast to admins via REST API');
    } catch (apiErr: any) {
      console.error('REST API alert failed:', apiErr);

      // FALLBACK: If REST API fails (e.g. not logged in), try direct socket emit
      const sent = socketService.sendEmergencyAlert(currentLoc, 'User triggered panic button');
      if (!sent) {
        setAlertError('Could not send alert. Please call 112 directly.');
      }
    }

    // Notify emergency contact
    const user = tokenManager.getUserData();
    if (user && user.emergencyContact) {
      emergencyContactService.sendSMS(
        { phone: user.emergencyContact, name: 'Emergency Contact' },
        {
          touristName: user.name,
          digitalId: user.digitalId,
          location: { latitude: currentLoc.latitude, longitude: currentLoc.longitude },
          message: "I need immediate help! I have triggered the panic button.",
          timestamp: new Date()
        }
      );
    }
  };

  const callPolice = () => {
    window.location.href = 'tel:112';
  };

  const callAmbulance = () => {
    window.location.href = 'tel:108';
  };

  if (alertSent) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
          <ShieldAlert size={80} color="var(--danger)" />
        </div>
        <h1 style={{ fontSize: '28px', color: 'var(--danger)', marginBottom: '16px' }}>Alert Sent!</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Your emergency alert has been sent to authorities.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Your location has been shared. Help is on the way.
        </p>

        {alertError && (
          <p style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', width: '100%' }}>
            ⚠️ {alertError}
          </p>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', width: '100%' }}>
          <button onClick={callPolice} className="btn btn-primary" style={{ backgroundColor: '#0056b3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={20} style={{ marginRight: '8px' }} /> Call Police (112)
          </button>
          
          <button onClick={() => setAlertSent(false)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            I am safe now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
      <h1 className="screen-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Emergency</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Use these options only in a real emergency.
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <div className="responsive-stack" style={{ position: 'relative', width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {countdown !== null && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: '50%',
              border: '8px solid var(--danger)',
              animation: 'pulse 1s infinite'
            }} />
          )}
          
          <button
            onClick={countdown !== null ? cancelAlert : initiateAlert}
            className="sos-main-button"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              backgroundColor: countdown !== null ? '#ff9999' : 'var(--danger)',
              border: 'none',
              boxShadow: '0 10px 30px rgba(220, 53, 69, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: countdown !== null ? 'scale(0.95)' : 'scale(1)',
              zIndex: 10
            }}
          >
            {countdown !== null ? (
              <>
                <span style={{ color: '#c82333', fontSize: '64px', fontWeight: 'bold' }}>{countdown}</span>
                <span style={{ color: '#c82333', fontSize: '16px', fontWeight: 'bold' }}>Tap to Cancel</span>
              </>
            ) : (
              <>
                <AlertCircle size={64} color="white" style={{ marginBottom: '10px' }} />
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>SOS</span>
                <span style={{ color: 'white', fontSize: '14px', opacity: 0.9 }}>Hold to alert</span>
              </>
            )}
          </button>
        </div>

      </div>

      <div style={{ marginTop: 'auto' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Direct Lines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button 
            onClick={callPolice}
            className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: 'none' }}
          >
            <ShieldAlert size={32} color="#0056b3" style={{ marginBottom: '8px' }} />
            <span style={{ fontWeight: '600' }}>Police</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>112</span>
          </button>

          <button 
            onClick={callAmbulance}
            className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: 'none' }}
          >
            <HeartPulse size={32} color="var(--danger)" style={{ marginBottom: '8px' }} />
            <span style={{ fontWeight: '600' }}>Ambulance</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>108</span>
          </button>
        </div>
        <button 
          onClick={() => navigate('/emergency-directory')}
          className="btn btn-outline" 
          style={{ width: '100%', marginTop: '16px', borderRadius: '12px', padding: '12px' }}
        >
          View Full Services Directory
        </button>
      </div>
    </div>
  );
};

export default EmergencyAlertScreen;
