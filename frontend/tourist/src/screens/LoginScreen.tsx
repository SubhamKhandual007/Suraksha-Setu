import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI, tokenManager } from '../services/api';
import { refreshAuthStatus } from '../hooks/useAuth';
import { signInWithGoogle } from '../services/firebase';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'tourist';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{3,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Email must be in valid format (e.g., example@gmail.com)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      if (response.success && response.token) {
        tokenManager.setToken(response.token);
        tokenManager.setUserData(response.user);
        refreshAuthStatus();
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      if (user && user.email) {
        const response = await authAPI.googleLogin({
          email: user.email,
          name: user.displayName || '',
          role: role
        });

        if (response.success && response.token) {
          tokenManager.setToken(response.token);
          tokenManager.setUserData(response.user);
          refreshAuthStatus();
          if (response.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(response.message || 'Google Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Image Section */}
        <div className="auth-image-section" style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', backdropFilter: 'blur(10px)' }}>
              <Shield color="white" size={40} />
            </div>
            <img 
              src={role === 'admin' ? "/assets/admin_photo.png" : "/assets/tourist_photo.png"} 
              alt="Login Banner" 
              style={{ 
                width: '100%', 
                maxWidth: '300px', 
                height: 'auto', 
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                marginBottom: '30px'
              }} 
            />
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
              {role === 'admin' ? 'Admin Portal' : 'Safe Travels'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '300px', margin: '0 auto' }}>
              {role === 'admin' 
                ? 'Welcome back to the safety management hub.' 
                : 'Login to access your digital ID and safety tools.'}
            </p>
          </div>
          {/* Subtle background pattern */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            opacity: 0.1, 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
            backgroundSize: '24px 24px' 
          }} />
        </div>

        {/* Form Section */}
        <div className="auth-form-section" style={{ flex: 1.2, padding: '60px 40px', backgroundColor: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a237e', marginBottom: '8px' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Login as {role.charAt(0).toUpperCase() + role.slice(1)} to continue</p>
          </div>
          
          {error && <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '50px' }}
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  style={{ paddingLeft: '50px', paddingRight: '50px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '16px 0', borderRadius: '14px', fontSize: '17px', fontWeight: '800' }}>
              {loading ? 'Logging in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Don't have an account? </span>
            <Link to={`/register?role=${role}`} style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Register here
            </Link>
          </div>

          {role === 'admin' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <span style={{ padding: '0 15px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              </div>

              <button 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="btn" 
                style={{ 
                  width: '100%',
                  backgroundColor: 'white', 
                  color: '#444', 
                  border: '1px solid #dee2e6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
                {loading ? 'Processing...' : `Continue with Google`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
