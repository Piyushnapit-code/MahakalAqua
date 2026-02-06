import { apiClient } from '../lib/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  registrationDate: string;
  rating: number;
  notes: string;
}

export interface CustomerFilters {
  search: string;
  status: string;
  city: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'active' | 'inactive';
  notes: string;
}

export interface UpdateCustomerData extends CreateCustomerData {
  id: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
  topSpendingCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
  }>;
  customersByCity: Array<{
    city: string;
    count: number;
  }>;
}

export interface CustomerAnalytics {
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  spendingDistribution: Array<{
    range: string;
    count: number;
  }>;
  retentionRate: number;
  averageLifetimeValue: number;
}

class CustomersService {
  // Get all customers with filtering and pagination
  async getCustomers(filters?: Partial<CustomerFilters>, page = 1, limit = 10) {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ customers: Customer[]; total: number; page: number; totalPages: number }>(`/customers?${params.toString()}`);
    return response;
  }

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response;
  }

  // Create new customer
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const response = await apiClient.post<Customer>('/customers', customerData);
    return response;
  }

  // Update customer
  async updateCustomer(id: string, customerData: Partial<UpdateCustomerData>): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, customerData);
    return response;
  }

  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete<void>(`/customers/${id}`);
  }

  // Update customer status
  async updateCustomerStatus(id: string, status: 'active' | 'inactive'): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/customers/${id}/status`, { status });
    return response;
  }

  // Bulk delete customers
  async bulkDeleteCustomers(customerIds: string[]): Promise<void> {
    await apiClient.post<void>('/customers/bulk-delete', { customerIds });
  }

  // Bulk update status
  async bulkUpdateStatus(customerIds: string[], status: 'active' | 'inactive'): Promise<void> {
    await apiClient.post<void>('/customers/bulk-status', { customerIds, status });
  }

  // Get customer statistics
  async getCustomerStats(): Promise<CustomerStats> {
    const response = await apiClient.get<CustomerStats>('/customers/stats');
    return response;
  }

  // Get customer analytics
  async getCustomerAnalytics(dateRange = '30d'): Promise<CustomerAnalytics> {
    const response = await apiClient.get<CustomerAnalytics>(`/customers/analytics?dateRange=${dateRange}`);
    return response;
  }

  // Get all cities
  async getCities(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/customers/cities');
    return response;
  }

  // Export customers
  async exportCustomers(filters?: Partial<CustomerFilters>, format = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    params.append('format', format);

    const response = await apiClient.get<Blob>(`/customers/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response;
  }

  // Import customers
  async importCustomers(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: number; errors: string[] }>('/customers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  // Search customers
  async searchCustomers(query: string, filters?: Partial<CustomerFilters>): Promise<Customer[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.city) params.append('city', filters.city);

    const response = await apiClient.get<Customer[]>(`/customers/search?${params.toString()}`);
    return response;
  }

  // Get customer orders
  async getCustomerOrders(customerId: string, page = 1, limit = 10) {
    const response = await apiClient.get<any>(`/customers/${customerId}/orders?page=${page}&limit=${limit}`);
    return response;
  }

  // Update customer rating
  async updateCustomerRating(customerId: string, rating: number): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/customers/${customerId}/rating`, { rating });
    return response;
  }

  // Add customer note
  async addCustomerNote(customerId: string, note: string): Promise<Customer> {
    const response = await apiClient.post<Customer>(`/customers/${customerId}/notes`, { note });
    return response;
  }
}

export const customersService = new CustomersService();