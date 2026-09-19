import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/api';
import Sidebar from './Sidebar';

/**
 * ProtectedRoute Component
 * Guards private routes and wraps them in the authenticated JobShield dashboard layout.
 */
export default function ProtectedRoute() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Mobile Header Bar */}
        <header className="mobile-topbar">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            ☰ Menu
          </button>
          <div className="brand-logo" style={{ fontSize: '1.1rem' }}>
            Job<span>Shield</span>
          </div>
        </header>

        {/* Backdrop for Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="modal-backdrop"
            style={{ zIndex: 39 }}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sub-page Render */}
        <Outlet />
      </div>
    </div>
  );
}
