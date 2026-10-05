import apiClient from './api';

export const getOverview = async () => {
  const response = await apiClient.get('/api/admin/overview');
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await apiClient.get('/api/admin/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await apiClient.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId, status, reason) => {
  const response = await apiClient.put(`/api/admin/users/${userId}/status`, { status, reason });
  return response.data;
};

export const updateUserRole = async (userId, role, reason) => {
  const response = await apiClient.put(`/api/admin/users/${userId}/role`, { role, reason });
  return response.data;
};

export const getAllAnalyses = async (params = {}) => {
  const response = await apiClient.get('/api/admin/analyses', { params });
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/api/admin/audit-logs', { params });
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await apiClient.get('/api/admin/system-health');
  return response.data;
};

export const sendUserNotification = async (userId, data) => {
  const response = await apiClient.post(`/api/admin/users/${userId}/notify`, data);
  return response.data;
};

export const sendPasswordResetEmail = async (userId) => {
  const response = await apiClient.post(`/api/admin/users/${userId}/reset-password-email`);
  return response.data;
};

export const forceUserLogout = async (userId) => {
  const response = await apiClient.post(`/api/admin/users/${userId}/force-logout`);
  return response.data;
};

export const deleteAnalysis = async (analysisId) => {
  const response = await apiClient.delete(`/api/admin/analyses/${analysisId}`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const createCampaign = async (campaignData) => {
  const response = await apiClient.post('/api/admin/campaigns', campaignData);
  return response.data;
};

export const getCampaigns = async (params = {}) => {
  const response = await apiClient.get('/api/campaigns', { params });
  return response.data;
};

export const deleteCampaign = async (campaignId) => {
  const response = await apiClient.delete(`/api/admin/campaigns/${campaignId}`);
  return response.data;
};

export const getReports = async (params = {}) => {
  const response = await apiClient.get('/api/community-reports', { params });
  return response.data;
};

export const deleteReport = async (reportId) => {
  const response = await apiClient.delete(`/api/admin/reports/${reportId}`);
  return response.data;
};

export const updateReportStatus = async (reportId, status, adminNotes = '') => {
  const response = await apiClient.put(`/api/admin/reports/${reportId}/status`, { status, adminNotes });
  return response.data;
};

export const adminService = {
  getOverview,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getAllAnalyses,
  getAuditLogs,
  getSystemHealth,
  sendUserNotification,
  sendPasswordResetEmail,
  forceUserLogout,
  deleteAnalysis,
  deleteUser,
  createCampaign,
  getCampaigns,
  deleteCampaign,
  getReports,
  deleteReport,
  updateReportStatus,
};

export default adminService;
