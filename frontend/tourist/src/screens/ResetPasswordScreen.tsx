import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';

const ResetPasswordScreen: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.resetPassword(token || '', password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.message || 'Reset failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token may be invalid or expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="auth-form-section" style={{ flex: 1, padding: '60px 40px', backgroundColor: 'white', borderRadius: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <ShieldCheck color="#10b981" size={32} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a237e', marginBottom: '12px' }}>Set New Password</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Your identity is verified. Please choose a strong new password.
            </p>
          </div>

          {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fee2e2', textAlign: 'center', fontWeight: '600' }}>{error}</div>}

          {success ? (
            <div className="fade-in" style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '24px', borderRadius: '20px', border: '1px solid #dcfce7', marginBottom: '30px' }}>
                <CheckCircle2 size={48} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>Success!</h3>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>
                  Your password has been reset successfully. Redirecting you to login...
                </p>
              </div>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                Go to Login Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label className="input-label" htmlFor="reset-new-password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: '50px', paddingRight: '50px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="reset-confirm-password">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: '50px' }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '16px 0', borderRadius: '14px', fontSize: '17px', fontWeight: '800', marginTop: '10px' }}>
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
                  <ArrowLeft size={18} /> Back to Forgot Password
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
