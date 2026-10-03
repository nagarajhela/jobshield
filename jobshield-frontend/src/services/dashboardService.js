import apiClient from './api';

export const getStats = async () => {
  const response = await apiClient.get('/api/dashboard/stats');
  return response.data;
};

export const dashboardService = {
  getStats,
};

export default dashboardService;
