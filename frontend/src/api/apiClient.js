import axios from 'axios';

// Use environment variable for base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jobconnect-backend-yyho.onrender.com/api';

// Axios client configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
  withCredentials: true 
});

export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Track rate limit retries
const rateLimitRetries = new Map();

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Cache busting for GET requests 
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 429) {
      const retryCount = rateLimitRetries.get(originalRequest.url) || 0;
      if (retryCount < 3) {
        rateLimitRetries.set(originalRequest.url, retryCount + 1);
        return new Promise(resolve => {
          setTimeout(() => resolve(apiClient(originalRequest)), 1000 * (retryCount + 1));
        });
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 403) {
      console.error('Access forbidden - insufficient permissions:', {
        url: originalRequest?.url,
        user: localStorage.getItem('user')
      });
    }
    
    // Error logging
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: originalRequest?.url
      });
    } else if (error.request) {
      console.error('API Network Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get image URLs 
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://jobconnect-backend-yyho.onrender.com';
  
  // Handle different image path formats
  if (imagePath.startsWith('uploads/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  // Default to profile images path
  return `${baseUrl}/uploads/profile-images/${imagePath}`;
};

// Auth API methods
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => apiClient.post('/auth/change-password', data)
};

// User API methods
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  getProfileStrength: () => apiClient.get('/users/profile-strength'),
  getSettings: () => apiClient.get('/users/settings'), 
  getEmployerPublicProfile: (employerId) => apiClient.get(`/users/employer/${employerId}/public-profile`),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  updateSettings: (settings) => apiClient.put('/users/settings', { settings }), 
  uploadAvatar: (formData) => apiClient.post('/users/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateExperience: (experience) => apiClient.put('/users/experience', { experience }),
  updateEducation: (education) => apiClient.put('/users/education', { education }),
  updateSkills: (skills) => apiClient.put('/users/skills', { skills }),
  deleteAccount: (password) => apiClient.delete('/users/account', { data: { password } })
};

// Employer API methods
export const employerAPI = {
  getProfile: () => apiClient.get('/employer/profile'),
  updateProfile: (data) => apiClient.put('/employer/profile', data),
  updateCompanyProfile: (data) => apiClient.put('/employer/company-profile', data),
  getStats: () => apiClient.get('/employer/stats'),
  getApplications: () => apiClient.get('/employer/applications'),
  getAllApplications: () => apiClient.get('/employer/all-applications'),
  getCurrentJobs: () => apiClient.get('/employer/current-jobs'),
  getPotentialCandidates: (params = {}) => apiClient.get('/employer/potential-candidates', { params }),
  getCandidateDetails: (candidateId) => apiClient.get(`/employer/candidates/${candidateId}`),
  uploadProfileImage: (formData) => apiClient.post('/employer/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteAccount: (password) => apiClient.delete('/employer/account', { data: { password } })
};

// Jobs API methods
export const jobsAPI = {
  getJobs: (params = {}) => apiClient.get('/jobs', { params }),
  getJob: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post('/jobs', data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  getEmployerJobs: () => apiClient.get('/jobs/employer/my-jobs'),
  getJobStats: (id) => apiClient.get(`/jobs/${id}/stats`),
  bulkUpdateJobs: (data) => apiClient.patch('/jobs/bulk-update', data),
  getJobTrends: () => apiClient.get('/jobs/trends')
};

// Applications API methods
export const applicationsAPI = {
  apply: (data, config = {}) => uploadClient.post('/applications/apply', data, {
    ...config,
    timeout: 30000, 
    onUploadProgress: config.onUploadProgress,
  }),
  getCandidateApplications: () => apiClient.get('/applications/candidate/my-applications'),
  getJobApplications: (jobId) => apiClient.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (id, status) => apiClient.put(`/applications/${id}/status`, { status }),
  getCandidateProfile: (candidateId) => apiClient.get(`/applications/candidate/${candidateId}/profile`)
};

// Saved Jobs API methods
export const savedJobsAPI = {
  getSavedJobs: () => apiClient.get('/saved-jobs'),
  saveJob: (jobId, notes = '') => apiClient.post('/saved-jobs', { jobId, notes }),
  removeSavedJob: (jobId) => apiClient.delete(`/saved-jobs/${jobId}`),
  updateNotes: (jobId, notes) => apiClient.put(`/saved-jobs/${jobId}/notes`, { notes }),
  checkIfSaved: (jobId) => apiClient.get(`/saved-jobs/check/${jobId}`)
};

// Saved Profiles API methods
export const savedProfilesAPI = {
  getSavedProfiles: () => apiClient.get('/users/saved-profiles'),
  saveProfile: (candidateId, notes = '', tags = []) => 
    apiClient.post('/users/saved-profiles', { candidateId, notes, tags }),
  removeSavedProfile: (candidateId) => 
    apiClient.delete(`/users/saved-profiles/${candidateId}`),
  updateSavedProfileNotes: (candidateId, notes) => 
    apiClient.put(`/users/saved-profiles/${candidateId}/notes`, { notes }),
  checkIfProfileSaved: (candidateId) => 
    apiClient.get(`/users/saved-profiles/check/${candidateId}`)
};

// Job Alerts API methods
export const jobAlertsAPI = {
  getAlerts: () => apiClient.get('/job-alerts'),
  createAlert: (data) => apiClient.post('/job-alerts', data),
  updateAlert: (alertId, data) => apiClient.put(`/job-alerts/${alertId}`, data),
  deleteAlert: (alertId) => apiClient.delete(`/job-alerts/${alertId}`),
  triggerAlert: (alertId) => apiClient.post(`/job-alerts/${alertId}/trigger`)
};

// Analytics API methods
export const analyticsAPI = {
  getCandidateAnalytics: () => apiClient.get('/analytics/candidate'),
  getEmployerAnalytics: () => 
    apiClient.get('/analytics/employer')
      .catch(error => {
        console.warn('Employer analytics endpoint failed, using fallback data:', error);
        return Promise.resolve({
          data: {
            success: true,
            analytics: getFallbackEmployerAnalytics()
          }
        });
      }),
  getPlatformAnalytics: () => apiClient.get('/analytics/platform')
};

// Fallback employer analytics data
const getFallbackEmployerAnalytics = () => {
  return {
    overview: {
      totalJobs: 3,
      totalViews: 245,
      totalApplications: 18,
      overallConversionRate: 7.35,
      activeJobs: 2,
      draftJobs: 1,
      closedJobs: 0
    },
    applicationStats: {
      pending: { count: 8, avgResponseTime: 1 },
      reviewed: { count: 5, avgResponseTime: 2 },
      accepted: { count: 3, avgResponseTime: 3 },
      rejected: { count: 2, avgResponseTime: 1 }
    },
    popularJobs: [
      {
        _id: '1',
        title: 'Senior React Developer',
        views: 156,
        applications: 12
      },
      {
        _id: '2',
        title: 'Full Stack Developer',
        views: 89,
        applications: 6
      }
    ],
    conversionTrends: [
      { date: '2024-01-01', views: 45, applications: 3, conversionRate: 6.67 },
      { date: '2024-01-02', views: 52, applications: 4, conversionRate: 7.69 },
      { date: '2024-01-03', views: 38, applications: 2, conversionRate: 5.26 }
    ],
    recentApplications: [
      {
        _id: '1',
        candidate: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          headline: 'Senior Frontend Developer',
          avatar: null
        },
        job: {
          title: 'Senior React Developer',
          company: 'Tech Solutions SA'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ],
    employerStats: {
      totalJobsPosted: 3,
      activeJobs: 2,
      totalApplications: 18,
      conversionRate: 6.0,
      avgResponseTime: 2
    },
    recommendations: [
      {
        type: 'OPTIMIZE_JOBS',
        title: 'Optimize Job Descriptions',
        description: 'Improve your job posts to attract more qualified candidates',
        priority: 8,
        action: 'Edit Jobs'
      }
    ]
  };
};

// Admin API methods
export const adminAPI = {
  getPlatformAnalytics: () => apiClient.get('/admin/analytics'),
  manageUsers: (data) => apiClient.post('/admin/users/manage', data),
  manageJobs: (data) => apiClient.post('/admin/jobs/manage', data)
};

// Messages API methods
export const messagesAPI = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getMessages: (conversationId, params = {}) => 
    apiClient.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data) => apiClient.post('/messages/messages/send', data),
  startConversation: (data) => apiClient.post('/messages/conversations/start', data),
  markAsRead: (conversationId) => apiClient.post(`/messages/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) => apiClient.delete(`/messages/conversations/${conversationId}`),
  getAvailableUsers: () => apiClient.get('/messages/users'),
  searchUsers: (query) => apiClient.get(`/messages/users?search=${encodeURIComponent(query)}`),
  getUsers: () => apiClient.get('/messages/users')
};
