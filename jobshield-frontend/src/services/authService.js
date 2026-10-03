import apiClient from './api';

export const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  if (response.data?.token) {
    localStorage.setItem('jobshield_token', response.data.token);
  }
  if (response.data?.user) {
    localStorage.setItem('jobshield_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (firstName, lastName, email, password, phoneNumber) => {
  const payload = {
    firstName,
    lastName,
    email,
    password,
    phoneNumber: phoneNumber || null,
  };
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error on backend:', error);
  } finally {
    localStorage.removeItem('jobshield_token');
    localStorage.removeItem('jobshield_user');
  }
};

export const verifyEmail = async (token) => {
  const response = await apiClient.get(`/api/auth/verify?token=${encodeURIComponent(token)}`);
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await apiClient.post('/api/auth/resend-verification', { email });
  return response.data;
};

export const directVerify = async (email) => {
  const response = await apiClient.get(`/api/auth/dev-verify?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await apiClient.put('/api/auth/me', data);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.put('/api/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const authService = {
  login,
  register,
  logout,
  verifyEmail,
  resendVerification,
  directVerify,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword,
};

export default authService;
