import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Phone, Heart, Eye, EyeOff } from 'lucide-react';
import { authAPI, tokenManager } from '../services/api';
import { refreshAuthStatus } from '../hooks/useAuth';
import { signInWithGoogle } from '../services/firebase';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyContact: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'tourist';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone, emergencyContact } = formData;
    
    if (!name.trim()) return "Please enter your full name";
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{3,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Email must be in valid format (e.g., example@gmail.com)";
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return "Phone number must be 10 digits and start with 6–9";
    
    if (role === 'tourist') {
      if (!phoneRegex.test(emergencyContact)) return "Emergency contact must be a valid 10-digit number";
      if (phone === emergencyContact) return "Emergency contact must be different from your number";
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      if (password.length < 8) return "Password must be at least 8 characters";
      return "Password must include uppercase, lowercase, numbers, and a special character (e.g., Subham@123)";
    }
    
    if (password !== confirmPassword) return "Confirm password must match";
    
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        role: role
      });

      if (response.success && response.token) {
        tokenManager.setToken(response.token);
        tokenManager.setUserData(response.user);
        refreshAuthStatus();
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/id');
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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
          setError(response.message || 'Google Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google Registration failed. Please try again.');
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
            <img 
              src={role === 'admin' ? "/assets/admin_photo.png" : "/assets/tourist_photo.png"} 
              alt="Registration Banner" 
              style={{ 
                width: '100%', 
                maxWidth: '350px', 
                height: 'auto', 
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                marginBottom: '30px'
              }} 
            />
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
              {role === 'admin' ? 'Admin Gateway' : 'Join Suraksha Setu'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '300px', margin: '0 auto' }}>
              {role === 'admin' 
                ? 'Empowering authorities to ensure every tourist is safe and protected.' 
                : 'Experience travel like never before with real-time safety and assistance.'}
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
        <div className="auth-form-section" style={{ flex: 1.2, padding: '40px', backgroundColor: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a237e', marginBottom: '10px' }}>
              Welcome to the Smart Tourist Safety System
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Create your Tourist Profile to stay safe and connected during your journey.
            </p>
          </div>
          
          {error && (
            <div style={{ 
              backgroundColor: '#fff5f5', 
              color: '#c53030', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              fontSize: '13px', 
              border: '1px solid #feb2b2',
              textAlign: 'left'
            }}>
              • {error}
            </div>
          )}

          <p style={{ fontSize: '14px', fontWeight: '600', color: '#444', marginBottom: '15px' }}>Please enter your details:</p>

          <form onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                <input 
                  type="text" 
                  name="name" 
                  className="input-field" 
                  style={{ paddingLeft: '50px' }} 
                  placeholder="Enter your full name (as per ID)" 
                  value={formData.name} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                <input 
                  type="email" 
                  name="email" 
                  className="input-field" 
                  style={{ paddingLeft: '50px' }} 
                  placeholder="Enter a valid email (e.g., example@gmail.com)" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--primary)', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 0.8
                }}>
                  <Phone size={18} />
                  <span>+91</span>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                </div>
                <input 
                  type="tel" 
                  name="phone" 
                  className="input-field" 
                  style={{ paddingLeft: '75px' }} 
                  placeholder="10-digit mobile number" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Emergency Contact */}
            {role === 'tourist' && (
              <div className="input-group">
                <label className="input-label">Emergency Contact Number</label>
                <div style={{ position: 'relative' }}>
                  <Heart size={20} color="var(--danger)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input 
                    type="tel" 
                    name="emergencyContact" 
                    className="input-field" 
                    style={{ paddingLeft: '50px' }} 
                    placeholder="Different 10-digit contact number" 
                    value={formData.emergencyContact} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            )}

            {/* Password Section */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="input-field" 
                    style={{ paddingLeft: '50px', paddingRight: '45px' }} 
                    placeholder="Create password" 
                    value={formData.password} 
                    onChange={handleChange} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    className="input-field" 
                    style={{ paddingLeft: '50px' }} 
                    placeholder="Re-enter" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading} 
              style={{ 
                width: '100%', 
                padding: '16px 0', 
                borderRadius: '14px', 
                fontSize: '17px', 
                fontWeight: '800',
                marginTop: '10px'
              }}
            >
              {loading ? 'Creating Account...' : 'Register Secure Profile'}
            </button>
          </form>

          {role === 'admin' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <span style={{ padding: '0 15px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              </div>

              <button 
                onClick={handleGoogleRegister} 
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

export default RegisterScreen;
