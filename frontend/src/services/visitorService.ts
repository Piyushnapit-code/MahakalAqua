import { apiClient } from '../lib/api';

export interface VisitorData {
  _id: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
  } | string; // Support both object and string formats for backward compatibility
  location?: {
    country?: string;
    city?: string;
    state?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    accuracy?: number;
    address?: string;
    timezone?: string;
  };
  contactInfo?: {
    name?: string; // Added name property
    email?: string; // Added email property
    phoneNumber?: string;
    countryCode?: string;
    isPhoneVerified: boolean;
    consentGiven: boolean;
    consentTimestamp?: string;
  };
  path: string;
  referrer: string;
  language: string;
  isNewVisitor: boolean;
  visitCount: number;
  pageViews: number;
  trafficSource: 'direct' | 'organic' | 'social' | 'referral' | 'email' | 'paid' | 'other';
  isBot: boolean;
  lastActivity: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorFilters {
  search?: string;
  device?: string; // Changed from deviceType to device
  hasContact?: string; // Changed to string to match form inputs
  hasLocation?: string; // Changed to string to match form inputs
  trafficSource?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface VisitorStats {
  totalVisitors: number;
  totalPageViews: number;
  avgPageViews: number;
  uniqueCountries: number;
  uniqueCities: number;
  withContact?: number;
  withLocation?: number;
  newVisitors?: number;
  returningVisitors?: number;
}

export interface VisitorResponse {
  success: boolean;
  visitors: VisitorData[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  stats: VisitorStats;
}

export const visitorService = {
  // Get all visitors
  getAllVisitors: async (filters: VisitorFilters = {}): Promise<VisitorResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<VisitorResponse>(
        `/analytics/visitors/all?${params.toString()}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error fetching all visitors:', error);
      throw new Error(error.message || 'Failed to fetch visitors');
    }
  },

  // Get visitors with contact information
  getVisitorsWithContact: async (filters: VisitorFilters = {}): Promise<VisitorResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<VisitorResponse>(
        `/analytics/visitors/contacts?${params.toString()}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Error fetching visitors with contact:', error);
      throw new Error(error.message || 'Failed to fetch visitors with contact information');
    }
  },

  // Get visitor analytics
  getVisitorAnalytics: async (period: string = '30d') => {
    try {
      const response = await apiClient.get(`/analytics/visitors?period=${period}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching visitor analytics:', error);
      throw new Error(error.message || 'Failed to fetch visitor analytics');
    }
  },

  // Get location analytics
  getLocationAnalytics: async (period: string = '30d') => {
    try {
      const response = await apiClient.get(`/analytics/visitors/locations?period=${period}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching location analytics:', error);
      throw new Error(error.message || 'Failed to fetch location analytics');
    }
  },

  // Track visitor
  trackVisitor: async (data: {
    consent: boolean;
    timestamp: string;
    userAgent: string;
    language: string;
    path: string;
    referrer: string;
  }) => {
    try {
      const response = await apiClient.post('/visitor/track', data);
      return response;
    } catch (error: any) {
      console.error('Error tracking visitor:', error);
      throw new Error(error.message || 'Failed to track visitor');
    }
  },

  // Update visitor location
  updateVisitorLocation: async (locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
  }) => {
    try {
      const response = await apiClient.post('/visitor/location', locationData);
      return response;
    } catch (error: any) {
      console.error('Error updating visitor location:', error);
      throw new Error(error.message || 'Failed to update visitor location');
    }
  },

  // Update visitor contact
  updateVisitorContact: async (contactData: {
    phoneNumber: string;
    countryCode?: string;
    consent: boolean;
  }) => {
    try {
      const response = await apiClient.post('/visitor/contact', contactData);
      return response;
    } catch (error: any) {
      console.error('Error updating visitor contact:', error);
      throw new Error(error.message || 'Failed to update visitor contact');
    }
  },

  // Get current visitor session
  getVisitorSession: async () => {
    try {
      const response = await apiClient.get('/visitor/session');
      return response;
    } catch (error: any) {
      console.error('Error getting visitor session:', error);
      throw new Error(error.message || 'Failed to get visitor session');
    }
  },

  // Export visitors data
  exportVisitors: async (filters?: VisitorFilters): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.device) params.append('device', filters.device);
      if (filters?.hasContact !== undefined) params.append('hasContact', filters.hasContact.toString());
      if (filters?.hasLocation !== undefined) params.append('hasLocation', filters.hasLocation.toString());
      if (filters?.trafficSource) params.append('trafficSource', filters.trafficSource);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || (() => { throw new Error('VITE_API_URL environment variable is required'); })();
      const response = await fetch(`${apiUrl}/analytics/visitors/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Export failed' }));
        throw new Error(errorData.message || 'Export failed');
      }

      const blob = await response.blob();
      return blob;
    } catch (error: any) {
      console.error('Error exporting visitors:', error);
      throw new Error(error.message || 'Failed to export visitors data');
    }
  },
};