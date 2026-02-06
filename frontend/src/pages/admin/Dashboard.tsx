import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Wrench,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatCurrency } from '../../lib/utils';
import { dashboardService } from '../../services/dashboardService';
import { apiClient } from '../../lib/api';
import { exportAll } from '../../lib/exportUtils';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' }
];

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  // Export all data mutation
  const exportAllMutation = useMutation({
    mutationFn: () => exportAll(),
    onSuccess: () => {
      toast.success('All data exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export data');
    }
  });

  // Real API data queries
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview', selectedTimeRange],
    queryFn: () => dashboardService.getDashboardOverview(selectedTimeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get revenue chart data from API
  const { data: chartData = [] } = useQuery({
    queryKey: ['revenue-chart', selectedTimeRange],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: { period: string; points: { date: string; revenue: number }[] };
      }>(`/analytics/revenue?period=${selectedTimeRange}`);

      const points = response?.data?.points || [];

      // Map to chart format
      return points.map((pt) => {
        const date = new Date(pt.date);
        const name =
          selectedTimeRange === '1y'
            ? date.toLocaleDateString('en-IN', { month: 'short' })
            : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        return {
          name,
          revenue: pt.revenue,
          target: pt.revenue, // for now, use same value as target so line stays aligned
        };
      });
    },
  });

  // Get top services data from API
  const { data: topServices = [] } = useQuery({
    queryKey: ['top-services', selectedTimeRange],
    queryFn: async () => {
      // For now, return sample data until we have a proper top services endpoint
      return [
        { name: 'RO Installation', count: 45, revenue: 45000, change: 12 },
        { name: 'Filter Replacement', count: 38, revenue: 19000, change: 8 },
        { name: 'System Repair', count: 32, revenue: 16000, change: -5 },
        { name: 'Maintenance', count: 28, revenue: 14000, change: 15 },
        { name: 'UV Installation', count: 13, revenue: 26000, change: 22 }
      ];
    },
  });

  // Transform data for components
  const stats = dashboardData ? dashboardService.transformToStats(dashboardData) : {
    totalServices: 0,
    totalContacts: 0,
    totalEnquiries: 0,
    totalRevenue: 0,
    servicesChange: 0,
    contactsChange: 0,
    enquiriesChange: 0,
    revenueChange: 0
  };

  const recentActivities = dashboardData ? dashboardService.transformRecentActivities(dashboardData) : [];
  const recentEnquiries = dashboardData ? dashboardService.transformRecentEnquiries(dashboardData) : [];

  const statCards = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      change: stats.servicesChange,
      icon: Wrench,
      color: 'blue'
    },
    {
      title: 'New Contacts',
      value: stats.totalContacts,
      change: stats.contactsChange,
      icon: MessageSquare,
      color: 'green'
    },
    {
      title: 'Enquiries',
      value: stats.totalEnquiries,
      change: stats.enquiriesChange,
      icon: HelpCircle,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    const normalized = typeof status === 'string' ? status.toLowerCase() : '';
    switch (normalized) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    const normalized = typeof type === 'string' ? type.toLowerCase() : '';
    switch (normalized) {
      case 'contact':
        return MessageSquare;
      case 'enquiry':
        return HelpCircle;
      case 'issue':
        return Wrench;
      default:
        return Clock;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - Admin Panel | Mahakal Aqua</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="bg-gray-300 rounded-2xl h-32"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-300 rounded-xl h-32"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-300 rounded-xl h-96"></div>
                <div className="bg-gray-300 rounded-xl h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Helmet>
          <title>Dashboard - Admin Panel | Mahakal Aqua</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-600 text-lg font-semibold mb-2">
                Failed to load dashboard data
              </div>
              <div className="text-red-500 mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      <Helmet>
        <title>Dashboard - Admin Panel | Mahakal Aqua</title>
      </Helmet>

      <div className="min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-blue-500/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center">
                    Welcome back, Admin! 👋
                  </h1>
                  <p className="text-blue-100 text-base md:text-lg mb-4 lg:mb-0">
                    Here's what's happening with your business today.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                  <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium">System Online</span>
                  </div>
                  <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
                    <Clock className="h-5 w-5 mr-2 text-blue-300" />
                    <span className="text-sm font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value} className="bg-blue-800 text-white">
                      {range.label}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => exportAllMutation.mutate()}
                  disabled={exportAllMutation.isPending}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>{exportAllMutation.isPending ? 'Exporting...' : 'Export All Data'}</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const isPositive = stat.change > 0;
                
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      stat.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      stat.color === 'green' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      stat.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      stat.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          stat.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          stat.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                          stat.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                          'bg-gradient-to-br from-gray-500 to-gray-600'
                        }`}>
                          <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          vs last period
                        </span>
                        <div className={`flex items-center space-x-1 text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${
                          isPositive
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                            : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                          ) : (
                            <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                          <span>{isPositive ? '+' : '-'}{Math.abs(stat.change)}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recent Activities */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activities
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentActivities.length > 0 ? recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.description}
                          </p>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className="text-xs text-gray-400">
                              {activity.time}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Services */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Services
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div key={service.name || String(index)} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.name || '—'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(service?.count ?? 0)} orders • {formatCurrency(service?.revenue ?? 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(service?.change ?? 0) > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          (service?.change ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(Number(service?.change ?? 0))}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Enquiries */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Enquiries
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </button>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View all
                    </button>
                  </div>
                </div>
                
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {recentEnquiries.length > 0 ? recentEnquiries.map((enquiry) => (
                    <div key={enquiry.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {enquiry?.name?.[0] ?? '—'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {enquiry?.name ?? '—'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {enquiry?.date ?? '—'}
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {enquiry?.service ?? '—'}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry?.status ?? 'Pending')}`}>
                          {enquiry?.status ?? 'Pending'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No recent enquiries</p>
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentEnquiries.length > 0 ? recentEnquiries.map((enquiry) => (
                        <tr key={enquiry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                    {enquiry?.name?.[0] ?? '—'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {enquiry?.name ?? '—'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {enquiry?.service ?? '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry?.status ?? 'Pending')}`}>
                              {enquiry?.status ?? 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {enquiry?.date ?? '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-gray-400 hover:text-gray-500">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No recent enquiries
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}