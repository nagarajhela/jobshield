import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authApi, getSavedUser } from '../services/api';

/**
 * Sidebar Component for Protected App Layout
 */
export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getSavedUser());

  useEffect(() => {
    let isMounted = true;
    authApi.getProfile()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch((err) => {
        console.warn('Could not fetch user profile:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/analyze', label: 'Analyze Job', icon: '🔍' },
    { to: '/scan-pdf', label: 'Scan PDF Offer', icon: '📄' },
    { to: '/history', label: 'Scan History', icon: '⏱️' },
    { to: '/campaigns', label: 'Scam Campaigns', icon: '🕸️' },
  ];

  const userInitials = profile
    ? `${(profile.firstName || 'U')[0]}${(profile.lastName || '')[0] || ''}`.toUpperCase()
    : 'JS';

  return (
    <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="brand-logo" onClick={onClose}>
          <div className="brand-icon">🛡️</div>
          <div className="brand-text">Job<span>Shield</span></div>
        </NavLink>
        {onClose && (
          <button 
            onClick={onClose} 
            className="btn btn-sm" 
            style={{ color: '#94a3b8', display: isOpen ? 'block' : 'none' }}
          >
            ✕
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">{userInitials}</div>
          <div className="user-info-text">
            <div className="user-name">
              {profile ? `${profile.firstName} ${profile.lastName}` : 'Shield Member'}
            </div>
            <div className="user-role">
              {profile?.role ? `ROLE: ${profile.role}` : profile?.email || 'Authenticated'}
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-logout btn-sm">
          <span>⎋</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
