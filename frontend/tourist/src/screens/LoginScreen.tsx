import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '900px',
        backgroundColor: '#171717',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #262626'
      }}>
        {/* Left Panel - Branding */}
        <div style={{
          flex: '1',
          background: '#0a0a0a',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '560px',
          borderRight: '1px solid #262626'
        }} className="mobile-hide">
          {/* Back button */}
          <button
            onClick={() => navigate('/welcome')}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: '#171717',
              border: '1px solid #262626',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a3a3a3',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#262626';
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: role === 'admin' ? '#fafafa' : '#c9a87c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              <Shield size={28} color="#0a0a0a" />
            </div>
            
            <h2 style={{
              fontSize: '32px',
              fontWeight: '500',
              color: '#fafafa',
              marginBottom: '16px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              {role === 'admin' ? 'Admin Portal' : 'Welcome Back'}
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#737373',
              lineHeight: '1.6',
              maxWidth: '280px'
            }}>
              {role === 'admin' 
                ? 'Access the safety management dashboard and monitor tourist security.' 
                : 'Sign in to access your digital ID, emergency tools, and safety features.'}
            </p>

            <div style={{
              marginTop: '48px',
              padding: '20px',
              background: '#171717',
              borderRadius: '14px',
              border: '1px solid #262626'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Powered by
              </div>
              <div style={{
                fontSize: '17px',
                fontWeight: '500',
                color: '#fafafa'
              }}>
                Suraksha Setu
              </div>
              <div style={{
                fontSize: '12px',
                color: '#525252',
                marginTop: '4px'
              }}>
                Safe Tourism Initiative
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div style={{
          flex: '1.1',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#171717'
        }}>
          {/* Mobile back button */}
          <button
            onClick={() => navigate('/welcome')}
            className="mobile-only"
            style={{
              background: '#262626',
              border: '1px solid #404040',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a3a3a3',
              marginBottom: '24px',
              width: 'fit-content'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '500',
              color: '#fafafa',
              marginBottom: '8px',
              letterSpacing: '-0.02em'
            }}>
              Sign In
            </h1>
            <p style={{
              color: '#737373',
              fontSize: '15px'
            }}>
              Continue as {role === 'admin' ? 'Administrator' : 'Tourist'}
            </p>
          </div>
          
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px',
                color: '#a3a3a3'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={18} 
                  color="#525252" 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }} 
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: '10px',
                    border: '1px solid #262626',
                    fontSize: '15px',
                    color: '#fafafa',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#0a0a0a'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a87c';
                    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,124,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#262626';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px',
                color: '#a3a3a3'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  color="#525252" 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }} 
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 44px',
                    borderRadius: '10px',
                    border: '1px solid #262626',
                    fontSize: '15px',
                    color: '#fafafa',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#0a0a0a'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a87c';
                    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,124,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#262626';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#525252',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '24px'
            }}>
              <Link 
                to="/forgot-password" 
                style={{
                  color: '#c9a87c',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: role === 'admin' ? '#fafafa' : '#c9a87c',
                color: '#0a0a0a',
                fontSize: '15px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            {role === 'admin' && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '24px 0',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#262626' }} />
                  <span style={{ color: '#525252', fontSize: '13px' }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#262626' }} />
                </div>
                
                <button
                  type="button"
                  onClick={handleFirebaseGoogleLogin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #262626',
                    backgroundColor: '#0a0a0a',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#fafafa',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#404040';
                    e.currentTarget.style.background = '#171717';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#262626';
                    e.currentTarget.style.background = '#0a0a0a';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}
          </form>

          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            color: '#737373',
            fontSize: '14px'
          }}>
            {"Don't have an account? "}
            <Link 
              to={`/register?role=${role}`} 
              style={{
                color: '#c9a87c',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
