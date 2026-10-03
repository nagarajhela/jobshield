import { useContext } from 'react';
import NotificationContext from '../context/NotificationContext';

/**
 * @typedef {Object} NotificationItem
 * @property {number|string} notificationId - Unique ID of notification
 * @property {string} title - Notification title
 * @property {string} message - Content summary
 * @property {string} type - Notification category (HIGH_RISK_DETECTED, NEW_CAMPAIGN, etc.)
 * @property {boolean} isRead - Read/unread state
 * @property {string} [createdAt] - ISO timestamp
 */

/**
 * @typedef {Object} NotificationContextType
 * @property {NotificationItem[]} notifications - Array of user notifications
 * @property {number} unreadCount - Number of unread notifications
 * @property {boolean} isLoading - Loading status flag
 * @property {() => Promise<void>} fetchNotifications - Refresh notifications list
 * @property {() => Promise<void>} fetchUnreadCount - Refresh unread counter
 * @property {(notificationId: number|string) => Promise<void>} markAsRead - Mark single item as read
 * @property {() => Promise<void>} markAllAsRead - Mark all items as read
 * @property {(notificationId: number|string) => Promise<void>} deleteNotification - Delete notification
 * @property {(notification: any) => void} addNotification - Add notification locally
 */

/**
 * Custom hook to access notifications context and unread counters.
 *
 * @returns {NotificationContextType} Notification context methods and state
 * @throws {Error} Thrown if invoked outside a NotificationProvider component
 *
 * @example
 * // Usage in a component:
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 * console.log('Unread notifications count:', unreadCount);
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider. Wrap your component tree with <NotificationProvider>.');
  }

  return context;
};

export default useNotifications;
