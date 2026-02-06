import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config/env';
import { storage } from './utils';

// Create axios instance with default config
const apiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = storage.get<string>('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Don't redirect on logout endpoint errors
    const isLogoutEndpoint = error.config?.url?.includes('/auth/logout');
    
    // Handle common errors
    if (error.response?.status === 401 && !isLogoutEndpoint) {
      // Unauthorized - clear token and redirect to login (except for logout)
      storage.remove('authToken');
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.get(url, config);
      return response.data as T;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'An error occurred');
    }
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.post(url, data, config);
      return response.data as T;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'An error occurred');
    }
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.put(url, data, config);
      return response.data as T;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'An error occurred');
    }
  },

  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.patch(url, data, config);
      return response.data as T;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'An error occurred');
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.delete(url, config);
      return response.data as T;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'An error occurred');
    }
  },
};

// Specific API endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  profile: '/auth/profile',
  
  // Services
  services: '/services',
  serviceById: (id: string) => `/services/${id}`,
  
  // RO Parts
  roParts: '/ro-parts',
  roPartById: (id: string) => `/ro-parts/${id}`,
  
  // Gallery
  gallery: '/gallery',
  galleryById: (id: string) => `/gallery/${id}`,
  
  // Contact
  contact: '/contact',
  contactById: (id: string) => `/contact/${id}`,
  
  // Enquiry
  enquiry: '/enquiry',
  enquiryById: (id: string) => `/enquiry/${id}`,
  
  // Issues
  issues: '/issues',
  issueById: (id: string) => `/issues/${id}`,
  
  // Analytics
  analytics: '/analytics',
  analyticsDashboard: '/analytics/dashboard',
  analyticsVisitors: '/analytics/visitors',
  analyticsPageViews: '/analytics/page-views',
  
  // Export
  exportContacts: '/export/contacts',
  exportEnquiries: '/export/enquiries',
  exportIssues: '/export/issues',
  exportServices: '/export/services',
  exportROParts: '/export/ro-parts',
  exportGallery: '/export/gallery',
  exportVisitors: '/export/visitors',
  exportAll: '/export/all',
};

export { api };
export default api;