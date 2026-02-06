import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Phone,
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  User,
  Mail
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { visitorService, type VisitorData, type VisitorFilters } from '../../services/visitorService';



const Visitors: React.FC = () => {
  const [filters, setFilters] = useState<VisitorFilters>({
    search: '',
    device: '',
    hasContact: '',
    hasLocation: '',
    dateRange: '30d'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorData | null>(null);

  // Fetch visitors data
  const {
    data: visitorsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['visitors', filters, currentPage],
    queryFn: () => visitorService.getAllVisitors({
      ...filters,
      page: currentPage,
      limit: 20
    }),
    staleTime: 30000, // 30 seconds
  });

  const handleFilterChange = (key: keyof VisitorFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Visitor data refreshed');
  };

  const handleExport = async () => {
    try {
      const blob = await visitorService.exportVisitors(filters);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `visitors-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Visitor data exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error?.message || 'Failed to export visitor data');
    }
  };

  const getDeviceIcon = (device: any) => {
    // Handle device object structure: { type, browser, os }
    if (!device) {
      return <Globe className="h-4 w-4 text-gray-400" />;
    }
    
    // If device is an object, use the type property
    const deviceType = typeof device === 'object' && device.type ? device.type.toLowerCase() : 
                      typeof device === 'string' ? device.toLowerCase() : 'unknown';
    
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-green-500" />;
      case 'desktop':
        return <Monitor className="h-4 w-4 text-purple-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLocation = (location?: VisitorData['location']) => {
    if (!location) return 'Unknown';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Visitors
            </h3>
            <p className="text-red-600 dark:text-red-300">
              Failed to load visitor data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Helmet>
        <title>Visitors - Mahakal Aqua Admin</title>
        <meta name="description" content="Manage and view visitor data and analytics" />
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Visitors
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Track and manage website visitors with location and contact data
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {visitorsData?.stats && (
            <>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Visitors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {visitorsData.stats.totalVisitors || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Contact Info</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {visitorsData.stats.withContact || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Location</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {visitorsData.stats.withLocation || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Page Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(visitorsData.stats.avgPageViews || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by phone, location, IP..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Device Type
                </label>
                <select
                  value={filters.device}
                  onChange={(e) => handleFilterChange('device', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Devices</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Info
                </label>
                <select
                  value={filters.hasContact || ''}
                  onChange={(e) => handleFilterChange('hasContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Visitors</option>
                  <option value="true">With Contact</option>
                  <option value="false">Without Contact</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location Data
                </label>
                <select
                  value={filters.hasLocation || ''}
                  onChange={(e) => handleFilterChange('hasLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Visitors</option>
                  <option value="true">With Location</option>
                  <option value="false">Without Location</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Visitors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visit Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                        <span className="text-gray-500 dark:text-gray-400">Loading visitors...</span>
                      </div>
                    </td>
                  </tr>
                ) : visitorsData?.visitors?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No visitors found</p>
                    </td>
                  </tr>
                ) : (
                  visitorsData?.visitors?.map((visitor: VisitorData) => (
                    <motion.tr
                      key={visitor._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {visitor.contactInfo?.name || visitor.contactInfo?.phoneNumber || `Visitor ${visitor.sessionId?.substring(0, 8) || visitor._id.substring(0, 8)}`}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {visitor.ipAddress}
                            </div>
                            {visitor.device && typeof visitor.device === 'object' && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {visitor.device.browser && visitor.device.browser !== 'Unknown' ? visitor.device.browser : ''}
                                {visitor.device.browser && visitor.device.os && visitor.device.os !== 'Unknown' ? ' • ' : ''}
                                {visitor.device.os && visitor.device.os !== 'Unknown' ? visitor.device.os : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {visitor.contactInfo ? (
                          <div>
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <Phone className="h-4 w-4 mr-2 text-green-500" />
                              {visitor.contactInfo.phoneNumber}
                            </div>
                            {visitor.contactInfo.email && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <Mail className="h-4 w-4 mr-2" />
                                {visitor.contactInfo.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No contact info</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                          {formatLocation(visitor.location)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          {getDeviceIcon(visitor.device)}
                          <div className="ml-2">
                            <div className="capitalize font-medium">
                              {visitor.device && typeof visitor.device === 'object' && visitor.device.type 
                                ? visitor.device.type 
                                : typeof visitor.device === 'string' ? visitor.device : 'Unknown'}
                            </div>
                            {visitor.device && typeof visitor.device === 'object' && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {visitor.device.browser && visitor.device.browser !== 'Unknown' ? visitor.device.browser : ''}
                                {visitor.device.browser && visitor.device.os && visitor.device.os !== 'Unknown' ? ' • ' : ''}
                                {visitor.device.os && visitor.device.os !== 'Unknown' ? visitor.device.os : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {visitor.pageViews} page views
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Visit #{visitor.visitCount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          {formatDate(visitor.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Last: {formatDate(visitor.lastActivity)}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {visitorsData?.pagination && visitorsData.pagination.pages > 1 && (
            <div className="bg-gray-50/80 dark:bg-gray-700/80 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, visitorsData.pagination.total)} of {visitorsData.pagination.total} visitors
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, visitorsData.pagination.pages))}
                    disabled={currentPage === visitorsData.pagination.pages}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Visitor Details
                </h3>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Name:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedVisitor.contactInfo?.name || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Phone:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedVisitor.contactInfo?.phoneNumber || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Email:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedVisitor.contactInfo?.email || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Location Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Location:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatLocation(selectedVisitor.location)}
                      </span>
                    </div>
                    {selectedVisitor.location?.coordinates && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Coordinates:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {selectedVisitor.location.coordinates.latitude.toFixed(6)}, {selectedVisitor.location.coordinates.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                    {selectedVisitor.location?.timezone && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Timezone:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {selectedVisitor.location.timezone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Technical Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      {getDeviceIcon(selectedVisitor.device)}
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2 ml-2">Device:</span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {selectedVisitor.device && typeof selectedVisitor.device === 'object' && selectedVisitor.device.type 
                          ? selectedVisitor.device.type 
                          : typeof selectedVisitor.device === 'string' ? selectedVisitor.device : 'Unknown'}
                      </span>
                    </div>
                    {selectedVisitor.device && typeof selectedVisitor.device === 'object' && (
                      <>
                        {selectedVisitor.device.browser && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Browser:</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {selectedVisitor.device.browser}
                            </span>
                          </div>
                        )}
                        {selectedVisitor.device.os && (
                          <div className="flex items-center">
                            <Monitor className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">OS:</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {selectedVisitor.device.os}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">IP Address:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedVisitor.ipAddress}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Page Views:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedVisitor.pageViews}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Visit Count:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedVisitor.visitCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visit Timeline */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Visit Timeline
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">First Visit:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedVisitor.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Last Activity:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedVisitor.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Visitors;