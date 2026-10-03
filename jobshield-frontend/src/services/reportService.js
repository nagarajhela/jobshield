import apiClient from './api';

export const getReports = async (params = {}) => {
  const response = await apiClient.get('/api/community-reports', { params });
  return response.data;
};

export const submitReport = async (data) => {
  const response = await apiClient.post('/api/community-reports', data);
  return response.data;
};

export const upvoteReport = async (reportId) => {
  const response = await apiClient.put(`/api/community-reports/${reportId}/upvote`);
  return response.data;
};

export const downvoteReport = async (reportId) => {
  const response = await apiClient.put(`/api/community-reports/${reportId}/downvote`);
  return response.data;
};

export const reportService = {
  getReports,
  submitReport,
  upvoteReport,
  downvoteReport,
};

export default reportService;
