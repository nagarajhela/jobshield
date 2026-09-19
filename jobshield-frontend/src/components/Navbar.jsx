import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, authApi } from '../services/api';

/**
 * Public Navbar Component
 */
export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <header className="public-navbar">
      <Link to="/" className="brand-logo">
        <div className="brand-icon">🛡️</div>
        <div className="brand-text">Job<span>Shield</span></div>
      </Link>

      <nav className="nav-links">
        {loggedIn ? (
          <>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              <span>Dashboard</span>
              <span>→</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
