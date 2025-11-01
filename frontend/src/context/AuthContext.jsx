import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api/apiClient.js';
import socketService from '../utils/socketService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch user data
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/me');
      setUser(response.data.user);
      setRateLimitExceeded(false);
      
      // Connect socket after fetching user
      socketService.connect();
      
    } catch (error) {
      console.error('Error fetching user:', error);
      
      if (error.response?.status === 429) {
        setRateLimitExceeded(true);
        console.log('Rate limit exceeded, will retry later');
        setTimeout(() => setRateLimitExceeded(false), 60000); // Reset after 1 minute
      } else if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  };

  // Update user state
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setRateLimitExceeded(false);
      
      // Connect socket after successful login
      socketService.connect();
      
      return { success: true };
    } catch (error) {
      let message = error.response?.data?.message || 'Login failed';
      
      if (error.response?.status === 429) {
        message = 'Too many login attempts. Please wait a moment and try again.';
        setRateLimitExceeded(true);
        setTimeout(() => setRateLimitExceeded(false), 60000);
      }
      
      return { 
        success: false, 
        message 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setRateLimitExceeded(false);
      
      // Connect socket after successful registration
      socketService.connect();
      
      return { success: true };
    } catch (error) {
      let message = error.response?.data?.message || 'Registration failed';
      
      if (error.response?.status === 429) {
        message = 'Too many registration attempts. Please wait a moment and try again.';
        setRateLimitExceeded(true);
        setTimeout(() => setRateLimitExceeded(false), 60000);
      }
      
      return { 
        success: false, 
        message 
      };
    }
  };

  // Logout function
  const logout = () => {
    // Disconnect socket first
    socketService.disconnect();
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRateLimitExceeded(false);
    delete apiClient.defaults.headers.common['Authorization'];
    
    // Redirect to login page after logout
    window.location.href = '/login';
  };

  // Context value
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    rateLimitExceeded,
    isAuthenticated: !!user,
    updateUser,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};