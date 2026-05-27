import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '../config/firebase';
import { authAPI, tokenManager } from '../services/api';
import { refreshAuthStatus } from '../hooks/useAuth';

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
  
  const handleFirebaseGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await authAPI.firebaseLogin(idToken, role);
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
        setError(response.message || 'Firebase login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Google authentication failed');
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
              src={role === 'admin' ? "/assets/admin_photo.webp" : "/assets/tourist_photo.webp"} 
              alt="Login safety portal banner graphic" 
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
              <label className="input-label" htmlFor="email-input">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                <input
                  id="email-input"
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
              <label className="input-label" htmlFor="password-input">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                <input
                  id="password-input"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
            
            {role === 'admin' && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-secondary)' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                  <span style={{ padding: '0 10px', fontSize: '14px' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleFirebaseGoogleLogin}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: '14px',
                      border: '2px solid #e0e0e0',
                      backgroundColor: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      transition: 'all 0.2s ease',
                      opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.borderColor = '#1a73e8';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,115,232,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    {loading ? 'Signing in...' : 'Sign in with Google'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Don't have an account? </span>
            <Link to={`/register?role=${role}`} style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
