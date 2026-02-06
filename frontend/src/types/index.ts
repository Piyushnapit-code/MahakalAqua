// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Service Types
export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  image?: string;
  isActive: boolean;
  category: 'installation' | 'maintenance' | 'repair' | 'consultation';
  createdAt: string;
  updatedAt: string;
}

// RO Parts Types
export interface ROPart {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  model?: string;
  compatibility: string[];
  image?: string;
  inStock: boolean;
  stockQuantity: number;
  category: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  specifications: Record<string, any>;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
}

// Gallery Types
export interface GalleryItem {
  _id: string;
  id: string;
  title: string;
  description?: string;
  image: string;
  imageUrl: string;
  category: 'installation' | 'maintenance' | 'products' | 'team' | 'residential' | 'commercial' | 'industrial';
  location: string;
  date: string;
  customerName: string;
  rating: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Contact Types
export interface ContactRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType?: string;
  preferredDate?: string;
  preferredTime?: string;
}

// Enquiry Types
export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  preferredDate: string;
  message?: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  preferredDate: string;
  message?: string;
  address?: string;
  city?: string;
  pincode?: string;
  propertyType?: string;
  familySize?: string;
  waterSource?: string;
  currentSystem?: string;
  issues?: string;
  preferredTime?: string;
  budget?: string;
  additionalRequirements?: string;
}

// Issue Types
export interface IssueRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  issueType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  preferredDate: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface IssueFormData {
  name: string;
  email: string;
  phone: string;
  issueType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  preferredDate: string;
}

// Admin Types
export interface Admin {
  _id: string;
  id?: string; // Alias for _id for compatibility
  username?: string; // Optional, can use email or name instead
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Analytics Types
export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserStats: Array<{
    browser: string;
    count: number;
  }>;
  locationStats: Array<{
    country: string;
    city: string;
    count: number;
  }>;
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  children?: NavItem[];
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

// Cookie Consent Types
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}