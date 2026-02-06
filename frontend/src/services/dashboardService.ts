import { apiClient } from '../lib/api';

export interface DashboardOverview {
  period: string;
  visitors: {
    totalVisits: number;
    uniqueVisitors: number;
    totalPageViews: number;
  };
  contacts: {
    total: number;
    pending: number;
    resolved: number;
  };
  enquiries: {
    total: number;
    pending: number;
    converted: number;
  };
  issues: {
    total: number;
    open: number;
    resolved: number;
  };
  revenue?: {
    current: number;
    previous: number;
  };
  content: {
    services: number;
    parts: number;
    galleryItems: number;
  };
  recentActivities: {
    contacts: any[];
    enquiries: any[];
    issues: any[];
  };
}

export interface DashboardStats {
  totalServices: number;
  totalContacts: number;
  totalEnquiries: number;
  totalRevenue: number;
  servicesChange: number;
  contactsChange: number;
  enquiriesChange: number;
  revenueChange: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
}

export interface RecentEnquiry {
  id: string;
  name: string;
  service: string;
  status: string;
  date: string;
}

class DashboardService {
  async getDashboardOverview(period: string = '30d'): Promise<DashboardOverview> {
    try {
      const response = await apiClient.get<{ success: boolean; data: DashboardOverview }>(`/analytics/dashboard?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      // Return default data structure
      return {
        period,
        visitors: { totalVisits: 0, uniqueVisitors: 0, totalPageViews: 0 },
        contacts: { total: 0, pending: 0, resolved: 0 },
        enquiries: { total: 0, pending: 0, converted: 0 },
        issues: { total: 0, open: 0, resolved: 0 },
        revenue: { current: 0, previous: 0 },
        content: { services: 0, parts: 0, galleryItems: 0 },
        recentActivities: { contacts: [], enquiries: [], issues: [] }
      };
    }
  }

  transformToStats(data: DashboardOverview): DashboardStats {
    const currentRevenue = data.revenue?.current ?? 0;
    const previousRevenue = data.revenue?.previous ?? 0;

    let revenueChange = 0;
    if (previousRevenue > 0) {
      revenueChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueChange = 100;
    }

    return {
      totalServices: data.content.services,
      totalContacts: data.contacts.total,
      totalEnquiries: data.enquiries.total,
      totalRevenue: currentRevenue,
      servicesChange: 0, // This would be calculated from historical data
      contactsChange: 0,
      enquiriesChange: 0,
      revenueChange: Math.round(revenueChange)
    };
  }

  transformRecentActivities(data: DashboardOverview): RecentActivity[] {
    const activities: RecentActivity[] = [];
    
    // Transform contacts
    data.recentActivities.contacts.forEach((contact, index) => {
      activities.push({
        id: `contact-${index}`,
        type: 'contact',
        title: `New contact from ${contact.name}`,
        description: `${contact.contactType} inquiry`,
        time: this.formatTimeAgo(contact.createdAt),
        status: contact.status
      });
    });

    // Transform enquiries
    data.recentActivities.enquiries.forEach((enquiry, index) => {
      activities.push({
        id: `enquiry-${index}`,
        type: 'enquiry',
        title: `New enquiry from ${enquiry.name}`,
        description: `${enquiry.serviceType} service`,
        time: this.formatTimeAgo(enquiry.createdAt),
        status: enquiry.status
      });
    });

    // Transform issues
    data.recentActivities.issues.forEach((issue, index) => {
      activities.push({
        id: `issue-${index}`,
        type: 'issue',
        title: `New issue: ${issue.ticketNumber}`,
        description: `${issue.issueType} - ${issue.priority} priority`,
        time: this.formatTimeAgo(issue.createdAt),
        status: issue.status
      });
    });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }

  transformRecentEnquiries(data: DashboardOverview): RecentEnquiry[] {
    return data.recentActivities.enquiries.map((enquiry, index) => ({
      id: `enquiry-${index}`,
      name: enquiry.name,
      service: enquiry.serviceType,
      status: enquiry.status,
      date: this.formatTimeAgo(enquiry.createdAt)
    }));
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}

export const dashboardService = new DashboardService();