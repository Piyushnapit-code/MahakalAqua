import { apiClient } from '../lib/api';

// Normalize backend service shape to frontend expectations
const normalizeService = (s: any) => {
  const imageUrl =
    (s.image && typeof s.image === 'object' && s.image.url) ||
    (typeof s.image === 'string' ? s.image : '') ||
    s.imageUrl ||
    '';

  const features: string[] = Array.isArray(s.features)
    ? s.features
    : typeof s.features === 'string'
      ? s.features.split(',').map((f: string) => f.trim()).filter(Boolean)
      : [];

  return {
    _id: s._id,
    name: s.name ?? s.title ?? '',
    title: s.title,
    description: s.description,
    category: s.category,
    price: s.price,
    duration: s.duration,
    isActive: s.isActive,
    features,
    image: imageUrl,
    rating: s.rating,
    totalBookings: s.totalBookings,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    serviceAreas: s.serviceAreas,
    featured: s.featured,
  };
};

export interface Service {
  _id: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  features: string[];
  image?: {
    filename?: string;
    url?: string;
  };
  rating?: number;
  totalBookings?: number;
  createdAt: string;
  updatedAt: string;
  serviceAreas?: string[];
  featured?: boolean;
}

export interface ServiceRequest {
  _id: string;
  service: Service;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  requestDate: string;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  address: string;
  notes: string;
  assignedTechnician?: string;
  totalAmount: number;
}

export interface ServiceFilters {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateServiceData {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  features: string[] | string;
  image?: string;
  isActive?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  _id: string;
}

export const servicesService = {
  // Get all services with filters
  getServices: async (filters: ServiceFilters = {}): Promise<{
    services: Service[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status === 'active') params.append('isActive', 'true');
      if (filters.status === 'inactive') params.append('isActive', 'false');
      if (filters.page) params.append('page', (filters.page ?? 1).toString());
      if (filters.limit) params.append('limit', (filters.limit ?? 20).toString());

      const response = await apiClient.get<any>(`/services/admin/list?${params.toString()}`);
      const data = response?.data ?? {};
      const services = Array.isArray(data.services) ? data.services.map(normalizeService) : [];
      const pagination = data.pagination ?? { page: 1, pages: 0, total: 0 };

      return {
        services,
        total: pagination.total ?? services.length,
        page: pagination.page ?? 1,
        totalPages: pagination.pages ?? 0,
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<Service> => {
    try {
      const response = await apiClient.get<any>(`/services/${id}`);
      const service = response?.data?.service ?? response;
      return normalizeService(service);
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  // Create new service
  createService: async (serviceData: CreateServiceData & { imageFile?: File | null }): Promise<Service> => {
    try {
      // If we have a pre-uploaded image URL, send JSON request (like Gallery)
      if (serviceData.image && !serviceData.imageFile) {
        const response = await apiClient.post<any>('/services', {
          title: serviceData.name,
          name: serviceData.name,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price,
          duration: serviceData.duration,
          features: Array.isArray(serviceData.features) ? serviceData.features : (serviceData.features && typeof serviceData.features === 'string' ? serviceData.features.split(',').map((f: string) => f.trim()) : []),
          image: serviceData.image,
          isActive: serviceData.isActive ?? true
        });
        const created = response?.data ?? response;
        return normalizeService(created?.data ?? created);
      }

      // If we have a file directly, use FormData
      const formData = new FormData();
      formData.append('title', serviceData.name);
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('category', serviceData.category);
      formData.append('price', String(serviceData.price));
      formData.append('duration', String(serviceData.duration));
      const featuresStr = Array.isArray(serviceData.features) ? serviceData.features.join(',') : (serviceData.features || '');
      formData.append('features', featuresStr);
      formData.append('isActive', String(serviceData.isActive ?? true));

      if (serviceData.imageFile) {
        formData.append('image', serviceData.imageFile);
      }

      const response = await apiClient.post<any>('/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const created = response?.data ?? response;
      return normalizeService(created?.data ?? created);
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service
  updateService: async (id: string, serviceData: Partial<CreateServiceData> & { imageFile?: File | null }): Promise<Service> => {
    try {
      // If we have a pre-uploaded image URL, send JSON request (like Gallery)
      if (serviceData.image && !serviceData.imageFile) {
        const response = await apiClient.put<any>(`/services/${id}`, {
          ...(serviceData.name && { title: serviceData.name, name: serviceData.name }),
          ...(serviceData.description && { description: serviceData.description }),
          ...(serviceData.category && { category: serviceData.category }),
          ...(serviceData.price !== undefined && { price: serviceData.price }),
          ...(serviceData.duration !== undefined && { duration: serviceData.duration }),
          ...(serviceData.features && { features: Array.isArray(serviceData.features) ? serviceData.features : (typeof serviceData.features === 'string' ? serviceData.features.split(',').map((f: string) => f.trim()) : []) }),
          image: serviceData.image,
          ...(serviceData.isActive !== undefined && { isActive: serviceData.isActive })
        });
        const updated = response?.data ?? response;
        return normalizeService(updated?.data ?? updated);
      }

      // If we have a file directly, use FormData
      const formData = new FormData();
      if (serviceData.name !== undefined) {
        formData.append('title', serviceData.name);
        formData.append('name', serviceData.name);
      }
      if (serviceData.description !== undefined) formData.append('description', serviceData.description);
      if (serviceData.category !== undefined) formData.append('category', serviceData.category);
      if (serviceData.price !== undefined) formData.append('price', String(serviceData.price));
      if (serviceData.duration !== undefined) formData.append('duration', String(serviceData.duration));
      if (serviceData.features !== undefined) {
        const featuresStr = Array.isArray(serviceData.features) ? serviceData.features.join(',') : (serviceData.features || '');
        formData.append('features', featuresStr);
      }
      if (serviceData.isActive !== undefined) formData.append('isActive', String(serviceData.isActive));

      if (serviceData.imageFile) {
        formData.append('image', serviceData.imageFile);
      }

      const response = await apiClient.put<any>(`/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updated = response?.data ?? response;
      return normalizeService(updated?.data ?? updated);
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service
  deleteService: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete<void>(`/services/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Toggle service status
  toggleServiceStatus: async (id: string): Promise<Service> => {
    try {
      const response = await apiClient.patch<any>(`/services/${id}/toggle-status`);
      const updated = response?.data ?? response;
      return normalizeService(updated);
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  },

  // Bulk delete services
  bulkDeleteServices: async (ids: string[]): Promise<void> => {
    try {
      const response = await apiClient.post<void>('/services/bulk-delete', { ids });
      return response;
    } catch (error) {
      console.error('Error bulk deleting services:', error);
      throw error;
    }
  },

  // Get service categories
  getServiceCategories: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<any>('/services');
      const categories: string[] = response?.data?.categories ?? [];
      return categories;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  // Service Requests APIs
  getServiceRequests: async (filters: ServiceFilters = {}): Promise<{
    requests: ServiceRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<{
        requests: ServiceRequest[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/service-requests?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  },

  // Update service request status
  updateServiceRequestStatus: async (id: string, status: ServiceRequest['status']): Promise<ServiceRequest> => {
    try {
      const response = await apiClient.patch<ServiceRequest>(`/api/service-requests/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating service request status:', error);
      throw error;
    }
  },

  // Assign technician to service request
  assignTechnician: async (id: string, technicianId: string): Promise<ServiceRequest> => {
    try {
      const response = await apiClient.patch<ServiceRequest>(`/api/service-requests/${id}/assign`, { 
        technicianId 
      });
      return response;
    } catch (error) {
      console.error('Error assigning technician:', error);
      throw error;
    }
  },

  // Get service statistics
  getServiceStats: async (): Promise<{
    totalServices: number;
    activeServices: number;
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    totalRevenue: number;
    avgRating: number;
  }> => {
      const response = await apiClient.get<any>('/services/admin/stats');
    const overview = response?.data?.overview ?? { total: 0, active: 0 };
    return {
      totalServices: overview.total ?? 0,
      activeServices: overview.active ?? 0,
      totalRequests: 0,
      pendingRequests: 0,
      completedRequests: 0,
      totalRevenue: 0,
      avgRating: 0,
    };
  },

  exportServices: async (filters: ServiceFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const response = await apiClient.get<Blob>(`/api/services/export?${params.toString()}`);
    return response;
  },

  importServices: async (file: File): Promise<{
    success: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{
      success: number;
      errors: string[];
    }>('/services/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  exportServiceRequests: async (filters: ServiceFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const response = await apiClient.get<Blob>(`/api/service-requests/export?${params.toString()}`);
    return response;
  },

  importServiceRequests: async (file: File): Promise<{
    success: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{
      success: number;
      errors: string[];
    }>('/service-requests/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};