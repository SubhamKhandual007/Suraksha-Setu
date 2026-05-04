import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Shield, ArrowLeft, CheckCircle2, Key } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState(''); // Store token for dev purposes
  const navigate = useNavigate();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        // In development, we return the token directly
        if (response.resetToken) {
          setToken(response.resetToken);
        }
      } else {
        setError(response.message || 'Failed to request reset token');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error requesting reset token. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="auth-form-section" style={{ flex: 1, padding: '60px 40px', backgroundColor: 'white', borderRadius: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Key color="var(--primary)" size={32} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a237e', marginBottom: '12px' }}>Forgot Password?</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fee2e2', textAlign: 'center', fontWeight: '600' }}>{error}</div>}

          {success ? (
            <div className="fade-in" style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '24px', borderRadius: '20px', border: '1px solid #dcfce7', marginBottom: '30px' }}>
                <CheckCircle2 size={48} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>Reset Link Sent!</h3>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>
                  If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                </p>
                {token && (
                   <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '12px', border: '1px dashed #16a34a' }}>
                     <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>[DEV MODE] Use this token to reset:</p>
                     <button 
                        onClick={() => navigate(`/reset-password/${token}`)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                     >
                        Reset Password Now
                     </button>
                   </div>
                )}
              </div>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ArrowLeft size={18} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRequestToken}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input
                    type="email"
                    className="input-field"
                    style={{ paddingLeft: '50px' }}
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '16px 0', borderRadius: '14px', fontSize: '17px', fontWeight: '800', marginTop: '10px' }}>
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
                  <ArrowLeft size={18} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
