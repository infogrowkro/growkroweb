import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, type: initialType = 'login' }) => {
  const [type, setType] = useState(initialType); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (type === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        // For demo - simulate successful signup
        const userData = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          isCreator: false,
          isAdmin: formData.email.includes('admin'), // Simple admin check for demo
          isSubscribed: false // New users start without subscription
        };
        
        // Store demo user
        localStorage.setItem('growkro_user', JSON.stringify(userData));
        alert('Account created successfully! Please subscribe to access creator features.');
        window.location.reload(); // Refresh to update auth state
      } else {
        // For demo - simulate login
        const savedUser = localStorage.getItem('growkro_user');
        if (savedUser) {
          alert('Login successful!');
          window.location.reload(); // Refresh to update auth state
        } else {
          setError('No account found. Please sign up first.');
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Placeholder for Google OAuth
    alert('Google OAuth will be integrated when API keys are configured');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        <div className="auth-modal-header">
          <h2>{type === 'login' ? 'Welcome Back' : 'Join GrowKro'}</h2>
          <p>{type === 'login' ? 'Sign in to your account' : 'Create your creator account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {type === 'signup' && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          {type === 'signup' && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn"
          >
            {isLoading ? 'Please wait...' : (type === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button onClick={handleGoogleAuth} className="google-auth-btn">
          <span className="google-icon">🔍</span>
          Continue with Google
        </button>

        <div className="auth-switch">
          {type === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setType('signup')}
                className="auth-switch-btn"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setType('login')}
                className="auth-switch-btn"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;