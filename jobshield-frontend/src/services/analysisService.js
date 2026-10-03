import apiClient from './api';

export const getHistory = async (params = {}) => {
  const response = await apiClient.get('/api/jobs/history', { params });
  return response.data;
};

export const getHistoryDetail = async (analysisId) => {
  const response = await apiClient.get(`/api/jobs/history/${analysisId}`);
  return response.data;
};

export const deleteAnalysis = async (analysisId) => {
  const response = await apiClient.delete(`/api/jobs/history/${analysisId}`);
  return response;
};

export const exportCSV = async () => {
  const response = await apiClient.get('/api/jobs/history/export/csv', {
    responseType: 'blob',
  });
  return response;
};

export const saveJob = async (analysisId) => {
  const response = await apiClient.post(`/api/jobs/${analysisId}/save`);
  return response.data;
};

export const unsaveJob = async (analysisId) => {
  const response = await apiClient.delete(`/api/jobs/${analysisId}/unsave`);
  return response;
};

export const getSavedJobs = async () => {
  const response = await apiClient.get('/api/jobs/saved');
  return response.data;
};

export const analyzeJob = async (data) => {
  const response = await apiClient.post('/api/jobs/analyze', data);
  return response.data;
};

export const analyzeUrl = async (url) => {
  const response = await apiClient.post('/api/jobs/analyze-url', { url });
  return response.data;
};

export const analyzePdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/jobs/analyze-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analysisService = {
  getHistory,
  getHistoryDetail,
  deleteAnalysis,
  exportCSV,
  saveJob,
  unsaveJob,
  getSavedJobs,
  analyzeJob,
  analyzeUrl,
  analyzePdf,
};

export default analysisService;

