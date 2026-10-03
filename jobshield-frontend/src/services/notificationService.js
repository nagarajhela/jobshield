import apiClient from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await apiClient.get('/api/notifications');
    return response.data;
  },

  getAllNotifications: async () => {
    const response = await apiClient.get('/api/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/api/notifications/unread-count');
    return response.data?.count ?? 0;
  },

  markAsRead: async (id) => {
    const response = await apiClient.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put('/api/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/api/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
