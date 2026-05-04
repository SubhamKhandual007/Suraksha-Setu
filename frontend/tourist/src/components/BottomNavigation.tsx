import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  UserCircle, 
  User, 
  ShieldAlert, 
  MessageSquare, 
  Navigation,
  Droplet,
  FlaskConical,
  HeartPulse
} from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailed = location.pathname === '/dashboard/detailed';

  if (isDetailed) {
    return (
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/emergency" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Droplet size={22} />
          <span>Emergency</span>
        </NavLink>
        <div className="nav-item" style={{ overflow: 'visible', position: 'relative' }}>
          <button className="chatbot-button" onClick={() => navigate('/chat')} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none', width: '64px', height: '64px', marginTop: '-32px', boxShadow: '0 8px 25px rgba(79, 70, 229, 0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', transition: 'transform 0.2s ease' }}>
            <div style={{ fontSize: '10px' }}>Suraksha</div>
          </button>
          <span style={{ marginTop: '35px', fontWeight: '800', color: '#4f46e5' }}>Chat Bot</span>
        </div>
        <NavLink to="/id" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FlaskConical size={22} />
          <span>Digital ID</span>
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Navigation size={22} />
          <span>Map</span>
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/emergency" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Droplet size={22} />
        <span>Emergency</span>
      </NavLink>

      <div className="nav-item" style={{ overflow: 'visible', position: 'relative' }}>
        <button 
          className="chatbot-button" 
          onClick={() => navigate('/chat')} 
          title="Suraksha Chatbot"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none', width: '64px', height: '64px', marginTop: '-32px', boxShadow: '0 8px 25px rgba(79, 70, 229, 0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}
        >
          <div style={{ fontSize: '10px' }}>Suraksha</div>
        </button>
        <span style={{ marginTop: '35px', fontWeight: '800', color: '#4f46e5', fontSize: '11px' }}>Suraksha Chatbot</span>
      </div>

      <NavLink to="/id" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FlaskConical size={22} />
        <span>Digital ID</span>
      </NavLink>
      <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Navigation size={22} />
        <span>Map</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavigation;
