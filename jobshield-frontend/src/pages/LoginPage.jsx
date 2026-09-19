import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';

/**
 * LoginPage Component
 * Handles user sign in and stores JWT token in localStorage.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(isExpired ? 'Your session has expired. Please sign in again.' : null);

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!credentials.email.trim() || !credentials.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with backend
      const loginRes = await authApi.login({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (!loginRes || !loginRes.token) {
        throw new Error('Authentication succeeded but no token received.');
      }

      // 2. Fetch user profile
      try {
        await authApi.getProfile();
      } catch (profileErr) {
        console.warn('Profile prefetch error:', profileErr);
      }

      // 3. Navigate to protected dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access the JobShield portal</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={credentials.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Your password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account yet?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
