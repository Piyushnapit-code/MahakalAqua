import { apiClient } from '../lib/api';

export interface ContactRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactType: 'general' | 'service_inquiry' | 'support' | 'complaint' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

export interface ContactFilters {
  search?: string;
  status?: string;
  contactType?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
}

export interface ContactStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  unread: number;
}

export interface CreateContactData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactType?: 'general' | 'service_inquiry' | 'support' | 'complaint' | 'other';
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateContactData {
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  resolution?: string;
}

export const contactService = {
  // Get contact requests with filtering
  getContactRequests: async (filters: ContactFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const response = await apiClient.get<{ 
      success: boolean; 
      data: { 
        requests: ContactRequest[]; 
        pagination: { 
          page: number; 
          limit: number; 
          total: number; 
          pages: number; 
        } 
      } 
    }>(`/contact?${params.toString()}`);
    
    // Handle the case where response might not have the expected structure
    if (response && response.data && response.data.requests) {
      return {
        data: response.data.requests,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        totalPages: response.data.pagination.pages
      };
    }
    
    // Fallback for unexpected response structure
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  },

  // Get single contact request
  getContactRequest: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: ContactRequest }>(`/contact/${id}`);
    if (response && response.data) {
      return response.data;
    }
    throw new Error('Contact request not found');
  },

  // Get contact statistics
  getContactStats: async () => {
    try {
      const response = await apiClient.get<{ 
        success: boolean; 
        data: { 
          overview: { 
            total: number; 
            pending: number; 
            inProgress: number; 
            resolved: number; 
            unread: number; 
          }; 
          byType: Array<{ _id: string; count: number }>; 
        } 
      }>('/contact/stats');
      
      if (response && response.data && response.data.overview) {
        return response.data.overview;
      }
      
      // Fallback data
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        unread: 0
      };
    } catch (error) {
      console.error('Failed to fetch contact stats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        unread: 0
      };
    }
  },

  // Update contact status (admin)
  updateContactStatus: async (id: string, data: UpdateContactData) => {
    const response = await apiClient.put<{ success: boolean; data: ContactRequest }>(`/contact/${id}`, data);
    return response.data;
  },

  // Assign contact request
  assignContactRequest: async (id: string, assignedTo: string) => {
    const response = await apiClient.post<{ success: boolean; data: ContactRequest }>(`/contact/${id}/assign`, { assignedTo });
    return response.data;
  },

  // Mark as read (admin)
  markAsReadAdmin: async (id: string) => {
    const response = await apiClient.patch<{ success: boolean; data: ContactRequest }>(`/contact/${id}/read`, {});
    return response.data;
  },

  // Delete contact request
  deleteContactRequest: async (id: string) => {
    await apiClient.delete<{ success: boolean; message: string }>(`/contact/${id}`);
  },

  // Export contact requests (placeholder - not implemented in backend)
  exportContactRequests: async (filters: ContactFilters = {}) => {
    // This endpoint doesn't exist in backend, so we'll create a CSV export client-side
    const data = await contactService.getContactRequests(filters);
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Type', 'Priority', 'Status', 'Created At'].join(','),
      ...data.data.map(contact => [
        contact.name,
        contact.email,
        contact.phone,
        contact.subject,
        contact.message.replace(/,/g, ';'),
        contact.contactType,
        contact.priority,
        contact.status,
        contact.createdAt
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    return blob;
  },

  // Submit contact form (public)
  submitContactFormPublic: async (data: CreateContactData) => {
    const response = await apiClient.post<{ success: boolean; data: { requestId: string } }>('/contact', data);
    return response.data;
  },

  // Alias for backward compatibility
  getContacts: async (filters: ContactFilters = {}) => {
    return contactService.getContactRequests(filters);
  },

  // Alias for backward compatibility
  getContactById: async (id: string) => {
    return contactService.getContactRequest(id);
  },

  // Alias for backward compatibility
  markAsRead: async (id: string) => {
    return contactService.markAsReadAdmin(id);
  },

  // Alias for backward compatibility
  deleteContact: async (id: string) => {
    return contactService.deleteContactRequest(id);
  }
};