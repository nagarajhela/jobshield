import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ShieldExclamationIcon,
  MegaphoneIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/layout/Navbar';
import EmptyState from '../components/common/EmptyState';
import notificationService from '../services/notificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD, HIGH_RISK, SECURITY

  useEffect(() => {
    document.title = 'Notifications | JobShield';
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error('Could not mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  // Filter list based on active tab
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'UNREAD') return !item.isRead;
      if (activeTab === 'HIGH_RISK') {
        const type = (item.type || '').toUpperCase();
        return type.includes('HIGH_RISK') || type.includes('DANGER');
      }
      if (activeTab === 'SECURITY') {
        const type = (item.type || '').toUpperCase();
        return type.includes('SECURITY') || type.includes('AUTH') || type.includes('LOGIN');
      }
      return true;
    });
  }, [notifications, activeTab]);

  // Group notifications into Today, Yesterday, This Week, Older
  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    filteredNotifications.forEach((item) => {
      let d = null;
      if (item.createdAt) {
        try {
          d = typeof item.createdAt === 'string' ? parseISO(item.createdAt) : new Date(item.createdAt);
          if (isNaN(d.getTime())) d = null;
        } catch (e) {
          d = null;
        }
      }

      if (!d) {
        groups.Older.push(item);
      } else if (isToday(d)) {
        groups.Today.push(item);
      } else if (isYesterday(d)) {
        groups.Yesterday.push(item);
      } else if (isThisWeek(d)) {
        groups['This Week'].push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  const renderTypeIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'HIGH_RISK_DETECTED' || t.includes('HIGH_RISK')) {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600 shadow-sm">
          <span className="text-lg">🚨</span>
        </div>
      );
    }
    if (t === 'NEW_CAMPAIGN' || t.includes('CAMPAIGN')) {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm">
          <span className="text-lg">📢</span>
        </div>
      );
    }
    if (t === 'SECURITY_ALERT' || t.includes('SECURITY')) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-sm">
          <span className="text-lg">🔐</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 shadow-sm">
        <span className="text-lg">ℹ️</span>
      </div>
    );
  };

  const groupKeys = ['Today', 'Yesterday', 'This Week', 'Older'];
  const hasItems = filteredNotifications.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Safety alerts, campaign investigations, and account security updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-sm transition-colors self-start sm:self-center"
            >
              <CheckIcon className="w-4 h-4" />
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs sm:text-sm font-semibold">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'UNREAD', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
            { id: 'HIGH_RISK', label: 'High Risk' },
            { id: 'SECURITY', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-gray-200 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !hasItems && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
            <EmptyState
              icon={BellIcon}
              title="All caught up!"
              message={
                activeTab === 'ALL'
                  ? 'You have no notifications yet. We will notify you when job risk updates occur.'
                  : `No notifications match your "${activeTab.toLowerCase().replace('_', ' ')}" filter.`
              }
            />
          </div>
        )}

        {/* GROUPED NOTIFICATIONS LIST */}
        {!loading && hasItems && (
          <div className="space-y-8">
            {groupKeys.map((groupTitle) => {
              const items = groupedNotifications[groupTitle];
              if (!items || items.length === 0) return null;

              return (
                <div key={groupTitle} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                    {groupTitle}
                  </h3>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 divide-y divide-gray-100 overflow-hidden">
                    {items.map((n) => {
                      const isUnread = !n.isRead;

                      return (
                        <div
                          key={n.notificationId}
                          onClick={() => {
                            if (isUnread) handleMarkAsRead(n.notificationId);
                          }}
                          className={`p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-all group cursor-pointer ${
                            isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-gray-50/80'
                          }`}
                        >
                          {/* Left: Icon circle */}
                          {renderTypeIcon(n.type)}

                          {/* Middle: Title, Message, Time */}
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-baseline justify-between gap-2">
                              <h4
                                className={`text-sm sm:text-base leading-snug ${
                                  isUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-800'
                                }`}
                              >
                                {n.title}
                              </h4>
                              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                {getTimeAgo(n.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                              {n.message}
                            </p>
                          </div>

                          {/* Right: Unread indicator & Delete */}
                          <div className="flex items-center gap-2 self-center flex-shrink-0">
                            {isUnread && (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-blue-600"
                                title="Unread notification"
                              />
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDelete(n.notificationId, e)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100"
                              title="Delete notification"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
