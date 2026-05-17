import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Map as MapIcon, 
  AlertCircle, 
  UserCircle, 
  ChevronRight,
  User,
  ShieldCheck,
  History,
  Bell,
  ShieldAlert,
  Navigation,
  MessageSquare,
  Ambulance,
  Hospital,
  Hotel,
  MapPin,
  Home,
  Droplet,
  FlaskConical,
  CreditCard,
  MessageCircle,
  Users
} from 'lucide-react';

import { tokenManager } from '../services/api';

// Importing assets
import logoImg from '../assets/logo.png';
import idImg from '../assets/dashboard/id.png';
import emergencyImg from '../assets/dashboard/emergency.png';
import mapImg from '../assets/dashboard/map.png';
import hospitalImg from '../assets/dashboard/hospital.png';
import ambulanceImg from '../assets/dashboard/ambulance.jpg';
import profileImg from '../assets/user_profile.png';
import policeStationImg from '../assets/dashboard/police_station.png';
import paymentsImg from '../assets/dashboard/payments.png';
import markerPremium from '../assets/map-marker-premium.png';
import communityChatImg from '../assets/community_chat.png';
import BottomNavigation from '../components/BottomNavigation';

// Alias for profile picture usage in detailed view
const profilePic = profileImg;

const DashboardCard: React.FC<{
  title: string;
  subtitle: string;
  image: string;
  icon: React.ReactNode;
  onClick: () => void;
  btnText: string;
}> = ({ title, subtitle, image, icon, onClick, btnText }) => (
  <div className="card" style={{ 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px',
    background: 'white',
    border: '1px solid #f1f5f9',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: '#f1f5f9', 
          padding: '10px', 
          borderRadius: '12px', 
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#1e293b' }}>{title}</h3>
      </div>
      <div style={{ color: '#cbd5e1' }}>
        <ChevronRight size={18} />
      </div>
    </div>
    
    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{subtitle}</p>
    
    <div style={{ 
      width: '100%', 
      height: '150px', 
      borderRadius: '16px', 
      overflow: 'hidden',
      background: '#f8fafc',
      marginTop: '5px',
      border: '1px solid #f1f5f9'
    }}>
      <img src={image} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
    </div>

    <button 
      onClick={onClick}
      className="btn" 
      style={{ 
        width: '100%', 
        padding: '12px', 
        fontSize: '14px', 
        fontWeight: '700',
        marginTop: '10px',
        background: '#f8fafc',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s'
      }}
    >
      {btnText}
    </button>
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

  if (mode === 'detailed') {
    return (
      <div className="fade-in" style={{ paddingBottom: '20px' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#2c3e50', margin: 0 }}>Hello {userData?.name || 'User'}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: '#f8fafc', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', position: 'relative' }}>
              <Bell size={24} color="#64748b" />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></div>
            </button>
            <div 
              onClick={() => navigate('/profile')}
              style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0', cursor: 'pointer' }}
            >
              <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* Top Action Row */}
        <div className="responsive-grid-1" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '12px', 
          marginBottom: '30px' 
        }}>
          <button 
            onClick={() => navigate('/emergency')}
            style={{ background: 'linear-gradient(180deg, #F44336 0%, #E91E63 100%)', border: 'none', borderRadius: '20px', padding: '24px 16px', color: 'white', minHeight: '140px', cursor: 'pointer', boxShadow: '0 8px 15px rgba(233, 30, 99, 0.2)' }}
          >
            <ShieldAlert size={28} />
            <div style={{ fontWeight: '800', marginTop: '12px' }}>Emergency Alert</div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', fontWeight: '500' }}>Stay calm, help is on the way.</div>
          </button>
          <button 
            onClick={() => navigate('/id')}
            style={{ background: 'linear-gradient(180deg, #2196F3 0%, #00BCD4 100%)', border: 'none', borderRadius: '20px', padding: '24px 16px', color: 'white', minHeight: '140px', cursor: 'pointer', boxShadow: '0 8px 15px rgba(33, 150, 243, 0.2)' }}
          >
            <UserCircle size={28} />
            <div style={{ fontWeight: '800', marginTop: '12px' }}>Digital ID</div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', fontWeight: '500' }}>Your verified tourist credentials</div>
          </button>
          <button 
            onClick={() => navigate('/map')}
            style={{ background: 'linear-gradient(180deg, #4CAF50 0%, #8BC34A 100%)', border: 'none', borderRadius: '20px', padding: '24px 16px', color: 'white', minHeight: '140px', cursor: 'pointer', boxShadow: '0 8px 15px rgba(76, 175, 80, 0.2)' }}
          >
            <Navigation size={28} />
            <div style={{ fontWeight: '800', marginTop: '12px' }}>Safety Map</div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', fontWeight: '500' }}>Real-time danger zone tracking</div>
          </button>
        </div>



        {/* AI Chat Bot Section */}
        <div 
          onClick={() => navigate('/chat')}
          className="card" 
          style={{ background: '#5dade2', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <MessageSquare size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>AI Chat Bot SURAKSHA</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Get instant safety assistance</div>
          </div>
          <ChevronRight size={20} />
        </div>

        {/* Tourist Community Section */}
        <div 
          onClick={() => navigate('/community-chat')}
          className="card" 
          style={{ background: '#6366f1', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Tourist Community</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Connect with other tourists</div>
          </div>
          <ChevronRight size={20} />
        </div>

        <div 
          onClick={() => navigate('/ambulance')}
          className="card" 
          style={{ background: '#e67e22', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <Ambulance size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Ambulance</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Emergency medical transport</div>
          </div>
          <ChevronRight size={20} />
        </div>

        <div 
          onClick={() => navigate('/map', { state: { filter: 'hospital' } })}
          className="card" 
          style={{ background: '#3498db', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <Hospital size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Hospitals</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Find nearby hospitals</div>
          </div>
          <ChevronRight size={20} />
        </div>

        <div 
          onClick={() => navigate('/map', { state: { filter: 'police' } })}
          className="card" 
          style={{ background: '#1a237e', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <Shield size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Police Station</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Emergency police assistance</div>
          </div>
          <ChevronRight size={20} />
        </div>

        <div 
          onClick={() => navigate('/hotels')}
          className="card" 
          style={{ background: '#27ae60', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <Hotel size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Nearby Hotels</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Safe accommodation options</div>
          </div>
          <ChevronRight size={20} />
        </div>

        <div 
          onClick={() => navigate('/payments')}
          className="card" 
          style={{ background: '#9b59b6', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
            <CreditCard size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Payment History</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Review your bookings & bills</div>
          </div>
          <ChevronRight size={20} />
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '20px' }}>
      {/* Welcome Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        borderRadius: '28px', 
        padding: '30px', 
        color: 'white', 
        marginBottom: '35px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract Background Element */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ 
          width: '85px', 
          height: '85px', 
          borderRadius: '22px', 
          background: 'white', 
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <img src={logoImg} alt="Suraksha Setu" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Suraksha Setu</h2>
          <p style={{ fontSize: '15px', opacity: 0.8, margin: '4px 0 0' }}>Welcome, <span style={{ color: '#60a5fa', fontWeight: '800' }}>{userData?.name || 'Tourist'}</span></p>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>Your personal safety companion</div>
        </div>
      </section>

      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--dark)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Dashboard
        </h2>
        <div style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '10px auto', borderRadius: '2px' }}></div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <DashboardCard 
          title="Suraksha Setu"
          subtitle="Your trusted safety companion"
          image={logoImg}
          icon={<Shield size={20} />}
          onClick={() => navigate('/dashboard/detailed')}
          btnText="Welcome"
        />

        <DashboardCard 
          title="Digital ID"
          subtitle="Your verified tourist credentials"
          image={idImg}
          icon={<UserCircle size={20} />}
          onClick={() => navigate('/id')}
          btnText="Go to Digital ID"
        />

        <DashboardCard 
          title="Emergency Alert"
          subtitle="Monitor and report safety incidents"
          image={emergencyImg}
          icon={<AlertCircle size={20} />}
          onClick={() => navigate('/emergency')}
          btnText="Go to Emergency Alert"
        />

        <DashboardCard 
          title="Safety Map"
          subtitle="Real-time danger zone tracking"
          image={markerPremium}
          icon={<MapIcon size={20} />}
          onClick={() => navigate('/map')}
          btnText="Go to Safety Map"
        />



        <DashboardCard 
          title="Nearby Hospitals"
          subtitle="Find immediate medical care"
          image={hospitalImg}
          icon={<Hospital size={20} />}
          onClick={() => navigate('/map', { state: { filter: 'hospital' } })}
          btnText="Find Hospital"
        />

        <DashboardCard 
          title="Police Stations"
          subtitle="Emergency police assistance"
          image={policeStationImg}
          icon={<Shield size={20} />}
          onClick={() => navigate('/map', { state: { filter: 'police' } })}
          btnText="Find Police"
        />

        <DashboardCard 
          title="Nearby Hotels"
          subtitle="Safe accommodation options"
          image="https://cdn.pixabay.com/photo/2015/09/07/19/12/hotel-928937_1280.jpg"
          icon={<Hotel size={20} />}
          onClick={() => navigate('/hotels')}
          btnText="Find Hotels"
        />

        <DashboardCard 
          title="Ambulance Service"
          subtitle="Emergency medical transport"
          image={ambulanceImg}
          icon={<Ambulance size={20} />}
          onClick={() => navigate('/ambulance')}
          btnText="Book Ambulance"
        />

        <DashboardCard 
          title="Tourist Community"
          subtitle="Share tips and connect with others"
          image={communityChatImg}
          icon={<Users size={20} />}
          onClick={() => navigate('/community-chat')}
          btnText="Join Community"
        />

        <DashboardCard 
          title="User Profile"
          subtitle="Manage your safety settings"
          image={profileImg}
          icon={<User size={20} />}
          onClick={() => navigate('/profile')}
          btnText="Go to Profile"
        />



        <DashboardCard 
          title="Payment History"
          subtitle="Review your bookings & bills"
          image={paymentsImg}
          icon={<CreditCard size={20} />}
          onClick={() => navigate('/payments')}
          btnText="View Payments"
        />


      </div>

      {/* Floating Community Chat Button */}
      <button 
        onClick={() => navigate('/community-chat')}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
        title="Community Chat"
      >
        <MessageCircle size={32} />
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '18px',
          height: '18px',
          background: '#22c55e',
          borderRadius: '50%',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}></div>
      </button>
    </div>
  );
};


export default DashboardScreen;




