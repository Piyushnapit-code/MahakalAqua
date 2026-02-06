import { apiClient } from '../lib/api';

export interface GalleryItem {
  _id: string;
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  isActive: boolean;
  featured: boolean;
  rating: number;
  views: number;
  likes: number;
  location?: string;
  projectDate?: string;
  client?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryFilters {
  search?: string;
  category?: string;
  status?: string;
  featured?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateGalleryItemData {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isActive?: boolean;
  featured?: boolean;
  location?: string;
  projectDate?: string;
  client?: string;
}

export interface UpdateGalleryItemData extends Partial<CreateGalleryItemData> {
  _id: string;
}

export interface GalleryStats {
  totalItems: number;
  activeItems: number;
  featuredItems: number;
  totalViews: number;
  totalLikes: number;
  categoriesCount: Record<string, number>;
}

export const galleryService = {
  // Get all gallery items
  getGalleryItems: async (filters?: Partial<GalleryFilters>, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ items: GalleryItem[]; total: number; page: number; totalPages: number }>(`/gallery?${params.toString()}`);
    return response;
  },

  // Get gallery item by ID
  getGalleryItemById: async (id: string): Promise<GalleryItem> => {
    const response = await apiClient.get<GalleryItem>(`/gallery/${id}`);
    return response;
  },

  // Create new gallery item
  createGalleryItem: async (itemData: CreateGalleryItemData): Promise<GalleryItem> => {
    const response = await apiClient.post<GalleryItem>('/gallery', itemData);
    return response;
  },

  // Update gallery item
  updateGalleryItem: async (id: string, itemData: Partial<UpdateGalleryItemData>): Promise<GalleryItem> => {
    const response = await apiClient.put<GalleryItem>(`/gallery/${id}`, itemData);
    return response;
  },

  // Delete gallery item
  deleteGalleryItem: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/gallery/${id}`);
  },

  // Toggle gallery item status
  toggleGalleryItemStatus: async (id: string): Promise<GalleryItem> => {
    const response = await apiClient.patch<GalleryItem>(`/gallery/${id}/toggle-status`);
    return response;
  },

  // Bulk delete gallery items
  bulkDeleteGalleryItems: async (itemIds: string[]): Promise<void> => {
    await apiClient.post<void>('/gallery/bulk-delete', { itemIds });
  },

  // Get gallery categories
  getGalleryCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/gallery/categories');
    return response;
  },

  // Get gallery statistics
  getGalleryStats: async (): Promise<GalleryStats> => {
    const response = await apiClient.get<GalleryStats>('/gallery/stats');
    return response;
  },

  // Export gallery data
  exportGallery: async (filters?: Partial<GalleryFilters>, format = 'csv'): Promise<Blob> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    params.append('format', format);

    const response = await apiClient.get<Blob>(`/gallery/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response;
  },

  // Import gallery data
  importGallery: async (file: File): Promise<{ success: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: number; errors: string[] }>('/gallery/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Update gallery item rating
  updateGalleryItemRating: async (itemId: string, rating: number): Promise<GalleryItem> => {
    const response = await apiClient.patch<GalleryItem>(`/gallery/${itemId}/rating`, { rating });
    return response;
  },

  // Increment views
  incrementViews: async (itemId: string): Promise<GalleryItem> => {
    const response = await apiClient.post<GalleryItem>(`/gallery/${itemId}/views`);
    return response;
  },

  // Toggle like
  toggleLike: async (itemId: string): Promise<GalleryItem> => {
    const response = await apiClient.post<GalleryItem>(`/gallery/${itemId}/like`);
    return response;
  }
};