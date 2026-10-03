import apiClient from './api';

export const getCampaigns = async (params = {}) => {
  const response = await apiClient.get('/api/campaigns', { params });
  return response.data;
};

export const getCampaignById = async (id) => {
  const response = await apiClient.get(`/api/campaigns/${id}`);
  return response.data;
};

export const getActiveCampaigns = async () => {
  const response = await apiClient.get('/api/campaigns/active');
  return response.data;
};

export const campaignService = {
  getCampaigns,
  getCampaignById,
  getActiveCampaigns,
};

export default campaignService;
