import { apiClient } from '../lib/api';

export interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
  };
  orders: {
    total: number;
    growth: number;
  };
  customers: {
    total: number;
    growth: number;
  };
  products: {
    total: number;
    growth: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
  }>;
  orderStatusChart: Array<{
    name: string;
    value: number;
  }>;
}

class AnalyticsService {
  async getAnalytics(period: string = '30d'): Promise<AnalyticsData> {
    try {
      const response = await apiClient.get<{ success: boolean; data: AnalyticsData }>(`/analytics/dashboard?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return default data structure
      return {
        revenue: { total: 0, growth: 0 },
        orders: { total: 0, growth: 0 },
        customers: { total: 0, growth: 0 },
        products: { total: 0, growth: 0 },
        revenueChart: [],
        orderStatusChart: []
      };
    }
  }

  async getVisitorAnalytics(period: string = '30d') {
    try {
      const data = await apiClient.get<any>(`/analytics/visitors?period=${period}`);
      return data;
    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
      return null;
    }
  }

  async getLocationAnalytics(period: string = '30d') {
    try {
      const data = await apiClient.get<any>(`/analytics/location?period=${period}`);
      return data;
    } catch (error) {
      console.error('Error fetching location analytics:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();