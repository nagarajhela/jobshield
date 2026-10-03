import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { supabase } from '../services/supabase';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (err) {
      // Silently handle background polling error
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      // Silently handle failure
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addNotification = useCallback((newNotif) => {
    if (!newNotif) return;
    const formatted = {
      notificationId: newNotif.notification_id || newNotif.notificationId || Date.now(),
      title: newNotif.title || 'New Notification',
      message: newNotif.message || '',
      type: newNotif.type || 'SYSTEM_INFO',
      isRead: newNotif.is_read ?? newNotif.isRead ?? false,
      createdAt: newNotif.created_at || newNotif.createdAt || new Date().toISOString(),
    };

    setNotifications((prev) => [formatted, ...prev]);
    if (!formatted.isRead) {
      setUnreadCount((c) => c + 1);
    }

    // Trigger toast based on notification type
    const t = (formatted.type || '').toUpperCase();
    if (t === 'HIGH_RISK_DETECTED' || t.includes('HIGH_RISK')) {
      toast.error(`🚨 High Risk Job Detected: ${formatted.title}`);
    } else if (t === 'NEW_CAMPAIGN' || t.includes('CAMPAIGN')) {
      toast(`📢 New Scam Campaign Alert: ${formatted.title}`, { icon: '📢' });
    } else if (t === 'SECURITY_ALERT' || t.includes('SECURITY')) {
      toast(`🔐 Security Alert: ${formatted.title}`, { icon: '🔐' });
    } else {
      toast(`ℹ️ ${formatted.title}`);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.notificationId === notificationId) {
          return { ...n, isRead: true };
        }
        return n;
      })
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      // Revert if request fails
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to mark all as read');
      fetchNotifications();
    }
  };

  const deleteNotification = async (notificationId) => {
    const target = notifications.find((n) => n.notificationId === notificationId);
    const wasUnread = target && !target.isRead;

    setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
      fetchNotifications();
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();

      const pollInterval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(pollInterval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isAuthenticated || !supabase || !currentUser?.userId) return;

    let channel = null;
    try {
      channel = supabase
        .channel(`notifications:user:${currentUser.userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUser.userId}`,
          },
          (payload) => {
            if (payload && payload.new) {
              addNotification(payload.new);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime notifications channel unavailable:', err);
    }

    return () => {
      if (channel && supabase) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isAuthenticated, currentUser?.userId, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
