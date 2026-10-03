import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheckIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  KeyIcon,
  ShieldExclamationIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

const Navbar = () => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch unread count & recent notifications
  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (e) {
      // ignore silently in background
    }
  };

  const fetchRecentNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Click outside listeners for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const toggleNotif = async () => {
    if (!isNotifOpen) {
      await fetchRecentNotifications();
      setIsUserMenuOpen(false);
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get initials for user avatar
  const initials = currentUser
    ? `${(currentUser.firstName?.[0] || '').toUpperCase()}${(currentUser.lastName?.[0] || '').toUpperCase()}` || 'U'
    : '';

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors duration-150 ${
      location.pathname === path
        ? 'text-blue-600 font-semibold'
        : 'text-gray-700 hover:text-blue-600'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <ShieldCheckIcon className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
                  Job<span className="text-blue-600">Shield</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  AI Protection
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  Home
                </Link>
                <Link to="/campaigns" className={navLinkClass('/campaigns')}>
                  Campaigns
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/analyze" className={navLinkClass('/analyze')}>
                  Analyze Job
                </Link>
                <Link to="/history" className={navLinkClass('/history')}>
                  History
                </Link>
                <Link to="/campaigns" className={navLinkClass('/campaigns')}>
                  Campaigns
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <ShieldExclamationIcon className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right: User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={toggleNotif}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none"
                    aria-label="View notifications"
                  >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-scale-in">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification list: top 5 */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-sm text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => {
                            const isHighRisk =
                              notif.type === 'HIGH_RISK' ||
                              (notif.title && notif.title.includes('High Risk'));
                            return (
                              <div
                                key={notif.notificationId}
                                onClick={() => handleMarkAsRead(notif.notificationId)}
                                className={`flex items-start gap-3 p-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notif.isRead ? 'bg-blue-50/40' : ''
                                }`}
                              >
                                <span className="text-lg flex-shrink-0 mt-0.5">
                                  {isHighRisk ? '🚨' : '🔔'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p
                                      className={`text-xs font-semibold truncate ${
                                        !notif.isRead ? 'text-gray-900' : 'text-gray-700'
                                      }`}
                                    >
                                      {notif.title}
                                    </p>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                    {notif.message}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-1">
                                    {notif.timeAgo || 'Recently'}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-gray-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotifOpen(false)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View all notifications &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar & User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        Profile Settings
                      </Link>

                      <Link
                        to="/profile#password"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <KeyIcon className="w-4 h-4 text-gray-400" />
                        Change Password
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={toggleNotif}
                className="p-2 text-gray-600 relative rounded-lg focus:outline-none"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none"
              aria-label="Open navigation menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Home
              </Link>
              <Link
                to="/campaigns"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Campaigns
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                to="/analyze"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Analyze Job
              </Link>
              <Link
                to="/history"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                History
              </Link>
              <Link
                to="/campaigns"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Campaigns
              </Link>
              <Link
                to="/notifications"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Notifications
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Profile & Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-purple-600 bg-purple-50"
                >
                  Admin Panel
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
