import { apiClient } from '../lib/api';
import config from '../config/env';

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: 'installation' | 'maintenance' | 'repair' | 'upgrade' | 'ro_installation' | 'ro_maintenance' | 'ro_repair' | 'water_testing' | 'consultation' | 'other';
  address: {
    street: string;
    city: string;
    pincode: string;
  };
  description: string;
  urgency: 'immediate' | 'within_week' | 'within_month' | 'flexible';
  status: 'new' | 'contacted' | 'site_visit_scheduled' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFilters {
  search?: string;
  status?: string;
  serviceType?: string;
  enquiryType?: string;
  source?: string;
  priority?: string;
  urgency?: string;
  assignedTo?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface EnquiryStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  unread: number;
  new?: number;
  contacted?: number;
  quoted?: number;
  converted?: number;
  closed?: number;
  byServiceType?: Array<{
    _id: string;
    count: number;
  }>;
  conversionRate?: number;
  averageValue?: number;
  totalEstimatedValue?: number;
}

export interface CreateEnquiryData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  enquiryType: 'product_info' | 'pricing' | 'installation' | 'maintenance' | 'technical_support' | 'general';
  productInterest?: string;
  message: string;
  source?: 'website' | 'phone' | 'email' | 'referral' | 'social_media' | 'other';
}

export interface UpdateEnquiryData {
  status?: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  followUpDate?: string;
  estimatedValue?: number;
  notes?: string;
}

export const enquiryService = {
  getEnquiries: async (filters: EnquiryFilters = {}): Promise<{
    enquiries: Enquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.enquiryType) params.append('enquiryType', filters.enquiryType);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.source) params.append('source', filters.source);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<{
        success: boolean;
        data: {
          enquiries: Enquiry[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      }>(`/enquiry?${params.toString()}`);

      const enquiries = response.data?.enquiries || [];
      const pagination = response.data?.pagination || { page: 1, limit: filters.limit || 10, total: 0, pages: 0 };

      return {
        enquiries,
        total: pagination.total,
        page: pagination.page,
        totalPages: pagination.pages,
      };
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw error;
    }
  },

  getEnquiryById: async (id: string): Promise<Enquiry> => {
    try {
      const response = await apiClient.get<Enquiry>(`/enquiry/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      throw error;
    }
  },

  createEnquiry: async (data: CreateEnquiryData): Promise<Enquiry> => {
    try {
      const response = await apiClient.post<Enquiry>('/enquiry', data);
      return response;
    } catch (error) {
      console.error('Error creating enquiry:', error);
      throw error;
    }
  },

  updateEnquiry: async (id: string, data: UpdateEnquiryData): Promise<Enquiry> => {
    try {
      const response = await apiClient.put<Enquiry>(`/enquiry/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating enquiry:', error);
      throw error;
    }
  },

  deleteEnquiry: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/enquiry/${id}`);
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      throw error;
    }
  },

  updateEnquiryStatus: async (id: string, status: Enquiry['status']): Promise<Enquiry> => {
    try {
      const response = await apiClient.put<Enquiry>(`/enquiry/${id}`, { status });
      return response;
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      throw error;
    }
  },

  assignEnquiry: async (id: string, assignedTo: string): Promise<Enquiry> => {
    try {
      const response = await apiClient.post<Enquiry>(`/enquiry/${id}/assign`, { assignedTo });
      return response;
    } catch (error) {
      console.error('Error assigning enquiry:', error);
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<Enquiry> => {
    try {
      const response = await apiClient.patch<Enquiry>(`/enquiry/${id}/read`);
      return response;
    } catch (error) {
      console.error('Error marking enquiry as read:', error);
      throw error;
    }
  },

  bulkUpdateStatus: async (ids: string[], status: Enquiry['status']): Promise<void> => {
    try {
      await apiClient.patch<void>('/enquiry/bulk-status', { ids, status });
    } catch (error) {
      console.error('Error bulk updating enquiry status:', error);
      throw error;
    }
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post<void>('/enquiry/bulk-delete', { ids });
    } catch (error) {
      console.error('Error bulk deleting enquiries:', error);
      throw error;
    }
  },

  getEnquiryStats: async (): Promise<EnquiryStats> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          overview: { total: number; pending: number; inProgress: number; resolved: number; unread: number };
          byServiceType: Array<{ _id: string; count: number }>;
        };
      }>('/enquiry/stats');

      const overview = response.data?.overview || { total: 0, pending: 0, inProgress: 0, resolved: 0, unread: 0 };
      const byServiceType = response.data?.byServiceType || [];

      return {
        total: overview.total,
        pending: overview.pending,
        inProgress: overview.inProgress,
        resolved: overview.resolved,
        unread: overview.unread,
        byServiceType,
      };
    } catch (error) {
      console.error('Error fetching enquiry stats:', error);
      throw error;
    }
  },

  exportEnquiries: async (filters?: EnquiryFilters): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${config.apiUrl}/enquiry/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting enquiries:', error);
      throw error;
    }
  },

  importEnquiries: async (file: File): Promise<{
    success: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{
      success: number;
      errors: string[];
    }>('/enquiry/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Submit enquiry (public)
  submitEnquiry: async (data: CreateEnquiryData): Promise<Enquiry> => {
    try {
      const response = await apiClient.post<Enquiry>('/enquiry', data);
      return response;
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      throw error;
    }
  },


};