import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { isTokenExpired } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(token && currentUser);
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN';
  const isAnalyst = currentUser?.role === 'ANALYST' || currentUser?.role === 'ROLE_ANALYST';

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setCurrentUser(userData);
      localStorage.setItem('jobshield_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.warn('Failed to refresh user credentials:', error);
      if (error?.response?.status === 401) {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('jobshield_token');
        localStorage.removeItem('jobshield_user');
      }
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('jobshield_token');
      const storedUser = localStorage.getItem('jobshield_user');

      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem('jobshield_token');
          localStorage.removeItem('jobshield_user');
          setToken(null);
          setCurrentUser(null);
        } else {
          setToken(storedToken);
          if (storedUser) {
            try {
              setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
              console.error('Failed to parse cached user:', e);
            }
          }
          await refreshUser();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const user = data.user || (await authService.getCurrentUser());
    setToken(data.token);
    setCurrentUser(user);
    toast.success(`Welcome back ${user?.firstName || ''}!`);
    return user;
  };

  const register = async (data) => {
    const res = await authService.register(
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.phoneNumber
    );
    toast.success('Registration successful! Please check your email.');
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isAnalyst,
        login,
        register,
        logout,
        refreshUser,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
