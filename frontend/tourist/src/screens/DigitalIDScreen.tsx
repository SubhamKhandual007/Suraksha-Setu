import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, User, MapPin, Calendar, Download, Share2, Globe, CheckCircle } from 'lucide-react';
import { tokenManager } from '../services/api';

const DigitalIDScreen: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [qrData, setQrData] = useState<string>('');

  useEffect(() => {
    const user = tokenManager.getUserData();
    if (user) {
      setUserData(user);
      // The QR code should link to the public verification page
      const verifyUrl = `${window.location.origin}/verify/${user.digitalId}`;
      setQrData(verifyUrl);
    }
  }, []);


  const handleDownload = () => {
    window.print();
  };
  const handleShare = async () => {
    if (!qrData) return;
    
    const shareData = {
      title: 'My Suraksha Tourist ID',
      text: `View my verified Tourist ID for safety and emergency contact details:`,
      url: qrData
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('ID link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };


  if (!userData) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '24px' }}>
        <h1 className="screen-title">Digital Identity</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verified Tourist Pass</p>
      </header>

      {/* Premium ID Card */}
      <div id="tourist-id-card" style={{
        background: 'var(--premium-gradient)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '220px'
      }}>
        {/* Background Pattern */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', opacity: 0.1, transform: 'rotate(15deg)' }}>
          <Shield size={200} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={16} />
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>Suraksha Setu Global</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{userData.name}</h2>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>Tourist Status: Verified</div>
          </div>
          <div style={{ background: 'white', padding: '10px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            {qrData && <QRCodeSVG value={qrData} size={70} level="H" includeMargin={false} />}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, fontWeight: '700', marginBottom: '4px' }}>Tourist ID No.</div>
            <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'monospace' }}>{userData.digitalId}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, fontWeight: '700', marginBottom: '4px' }}>Nationality</div>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>{userData.country || 'International'}</div>
          </div>
        </div>
      </div>

      {/* Details List */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Verification Details</h3>
        <div className="card" style={{ padding: '0' }}>
          <div className="responsive-stack" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: 'var(--primary)', background: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
              <Globe size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Issuing Authority</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>National Safety Board</div>
            </div>
            <CheckCircle size={18} color="var(--success)" className="mobile-hide" />
          </div>

          <div className="responsive-stack" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: 'var(--info)', background: '#e0f2fe', padding: '10px', borderRadius: '12px' }}>
              <Calendar size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Registration Date</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(userData.createdAt || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="responsive-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: 'var(--danger)', background: '#fef2f2', padding: '10px', borderRadius: '12px' }}>
              <MapPin size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Region Access</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>All Districts (Active)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="responsive-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <button onClick={handleDownload} className="btn" style={{ background: 'white', color: 'var(--dark)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <Download size={18} />
          Download ID
        </button>
        <button onClick={handleShare} className="btn btn-primary">
          <Share2 size={18} />
          Share ID
        </button>
      </div>
      
      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', padding: '10px' }}>
        This ID is scannable by police, medical staff, and hotel administrators to view your full safety profile.
      </p>
    </div>
  );
};

export default DigitalIDScreen;

