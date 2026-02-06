import { apiClient } from '../lib/api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superAdmin';
  isActive: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  superAdmins: number;
  recentLogins: number;
  lockedAccounts: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'superAdmin' | 'user';
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'superAdmin' | 'user';
  isActive?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superAdmin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockUntil?: string;
  profilePicture?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  action?: string;
  dateRange?: string;
}

export interface UserActivity {
  _id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export const userService = {
  // Get all users (admin only)
  getUsers: async (filters: UserFilters = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/users?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/users/profile');
      return response;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Create new user (admin only)
  createUser: async (data: CreateUserData): Promise<User> => {
    try {
      const response = await apiClient.post<User>('/users', data);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (data: UpdateUserData): Promise<User> => {
    try {
      const response = await apiClient.put<User>('/users/profile', data);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      const response = await apiClient.post<void>('/users/change-password', data);
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete<void>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Update user status (admin only)
  updateUserStatus: async (id: string, status: User['status']): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(`/users/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (id: string, role: User['role']): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
      return response;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Bulk operations (admin only)
  bulkUpdateStatus: async (ids: string[], status: User['status']): Promise<void> => {
    try {
      const response = await apiClient.patch<void>('/users/bulk-status', { ids, status });
      return response;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    try {
      const response = await apiClient.post<void>('/users/bulk-delete', { ids });
      return response;
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  },

  // Get user statistics (admin only)
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get<UserStats>('/users/stats');
      return response;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Export users (admin only)
  exportUsers: async (filters: UserFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const response = await apiClient.get<Blob>(`/users/export?${params.toString()}`);
    return response;
  },

  // Import users (admin only)
  importUsers: async (file: File): Promise<{
    success: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{
      success: number;
      errors: string[];
    }>('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiClient.post<{ url: string }>('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get user activity log (admin only)
  getUserActivity: async (id: string, filters: ActivityFilters = {}): Promise<{
    activities: UserActivity[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.action) params.append('action', filters.action);
    if (filters.dateRange) params.append('dateRange', filters.dateRange);

    const response = await apiClient.get<{
      activities: UserActivity[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/users/${id}/activity?${params.toString()}`);
    return response;
  },

  // Reset user password (admin only)
  resetUserPassword: async (id: string): Promise<{ temporaryPassword: string }> => {
    try {
      const response = await apiClient.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`);
      return response;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  },

  // Unlock user account (admin only)
  unlockUser: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(`/users/${id}/unlock`);
      return response;
    } catch (error) {
      console.error('Error unlocking user:', error);
      throw error;
    }
  },

  // Toggle user status (admin only)
  toggleUserStatus: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(`/api/users/${id}/toggle-status`);
      return response;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    try {
      const response = await apiClient.post<void>('/users/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      const response = await apiClient.post<void>('/users/verify-email', { token });
      return response;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    try {
      const response = await apiClient.post<void>('/users/resend-verification');
      return response;
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }
};