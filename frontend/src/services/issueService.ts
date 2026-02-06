import { apiClient } from '../lib/api';

export interface Issue {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueType: 'installation' | 'maintenance' | 'repair' | 'replacement' | 'water_quality' | 'billing' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  address?: string;
  preferredContactTime?: string;
  assignedTo?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export type IssueRequest = Issue;

export interface IssueFilters {
  search?: string;
  status?: string;
  issueType?: string;
  urgency?: string;
  assignedTo?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IssueStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byType: {
    installation: number;
    maintenance: number;
    repair: number;
    replacement: number;
    water_quality: number;
    billing: number;
    other: number;
  };
  byUrgency: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  averageResolutionTime: number;
  resolutionRate: number;
}

export interface CreateIssueData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueType: 'installation' | 'maintenance' | 'repair' | 'replacement' | 'water_quality' | 'billing' | 'other';
  description: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  address?: string;
  preferredContactTime?: string;
}

export interface UpdateIssueData {
  status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  notes?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export const issueService = {
  // Get all issue requests (admin)
   getIssueRequests: async (filters: IssueFilters = {}) => {
     const params = new URLSearchParams();
     
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== '') {
         params.append(key, value.toString());
       }
     });

     const response = await apiClient.get<{
       issues: Issue[];
       total: number;
       page: number;
       totalPages: number;
     }>(`/issues?${params}`);
     return response;
   },

   // Get single issue request
   getIssueRequest: async (id: string) => {
     const response = await apiClient.get<Issue>(`/issues/${id}`);
     return response;
   },

   // Submit issue request (public)
   submitIssueRequest: async (data: CreateIssueData) => {
     const response = await apiClient.post<Issue>('/issues', data);
     return response;
   },

  getIssues: async (filters: IssueFilters = {}): Promise<{
    issues: Issue[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.issueType) params.append('issueType', filters.issueType);
      if (filters.urgency) params.append('urgency', filters.urgency);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<{
        issues: Issue[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/issues?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },

  getIssueById: async (id: string): Promise<Issue> => {
    try {
      const response = await apiClient.get<Issue>(`/issues/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }
  },

  createIssue: async (data: CreateIssueData): Promise<Issue> => {
    try {
      const response = await apiClient.post<Issue>('/issues', data);
      return response;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  updateIssue: async (id: string, data: UpdateIssueData): Promise<Issue> => {
    try {
      const response = await apiClient.put<Issue>(`/issues/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  },

  deleteIssue: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/issues/${id}`);
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  },

  updateIssueStatus: async (id: string, status: Issue['status']): Promise<Issue> => {
    try {
      const response = await apiClient.patch<Issue>(`/issues/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  },

  assignIssue: async (id: string, assignedTo: string): Promise<Issue> => {
    try {
      const response = await apiClient.patch<Issue>(`/issues/${id}/assign`, { assignedTo });
      return response;
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  },

  addComment: async (id: string, comment: string): Promise<Issue> => {
    try {
      const response = await apiClient.post<Issue>(`/issues/${id}/comments`, { comment });
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<Issue> => {
    try {
      const response = await apiClient.patch<Issue>(`/issues/${id}/read`, { isRead: true });
      return response;
    } catch (error) {
      console.error('Error marking issue as read:', error);
      throw error;
    }
  },

  bulkUpdateStatus: async (ids: string[], status: Issue['status']): Promise<void> => {
    try {
      await apiClient.patch<void>('/issues/bulk-status', { ids, status });
    } catch (error) {
      console.error('Error bulk updating issue status:', error);
      throw error;
    }
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post<void>('/issues/bulk-delete', { ids });
    } catch (error) {
      console.error('Error bulk deleting issues:', error);
      throw error;
    }
  },

  getIssueStats: async (): Promise<IssueStats> => {
    try {
      const response = await apiClient.get<IssueStats>('/issues/stats');
      return response;
    } catch (error) {
      console.error('Error fetching issue stats:', error);
      throw error;
    }
  },

  exportIssues: async (filters: IssueFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const response = await apiClient.get<Blob>(`/issues/export?${params.toString()}`);
    return response;
  },

  importIssues: async (file: File): Promise<{
    success: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{
      success: number;
      errors: string[];
    }>('/issues/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }
};