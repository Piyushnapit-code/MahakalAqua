import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Camera,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Grid,
  List,
  Star,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Heart,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatDate, getPlaceholderImage } from '../../lib/utils';
import { ImageUpload, type UploadedImage } from '../../components/common/ImageUpload';
import { useImageUpload } from '../../hooks/useImageUpload';

interface GalleryItem {
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
  rating?: number;
  views?: number;
  likes?: number;
  location?: string;
  projectDate?: string;
  client?: string;
  createdAt: string;
  updatedAt: string;
}

// Filters interface removed along with filter UI

const categories = [
  'residential',
  'commercial',
  'industrial',
  'Installation',
  'Maintenance',
  'Repair',
  'Testing',
  'Parts',
  'Customers',
  'Team',
  'Before/After'
];

const Gallery: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State management
  // Filters UI removed
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Fetch gallery items
  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['gallery-admin'],
    queryFn: async () => {
      const response = await api.get('/gallery/admin/list');
      return response.data;
    }
  });

  // Fetch gallery stats
  const { data: stats } = useQuery({
    queryKey: ['gallery-stats'],
    queryFn: async () => {
      const response = await api.get('/gallery/admin/stats');
      return response.data;
    }
  });

  // Transform gallery items to ensure imageUrl is available
  const galleryItems = (galleryData?.items || []).map((item: any) => {
    const imageUrl = item.imageUrl || item.image?.url || '';
    // Ensure image URL is absolute (prepend API base URL for uploads, not /api)
    let fullImageUrl = imageUrl;
    if (imageUrl && !imageUrl.startsWith('http')) {
      // For /uploads/* paths, remove /api from the URL
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error('VITE_API_URL environment variable is required');
      const baseUrl = apiUrl.replace('/api', ''); // Remove /api to get base URL
      fullImageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    return {
      ...item,
      id: item.id || item._id,
      imageUrl: fullImageUrl,
      thumbnailUrl: fullImageUrl
    };
  });

  // Delete gallery item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      toast.success('Gallery item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete gallery item');
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/gallery/${id}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/gallery/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      setSelectedItems([]);
      toast.success('Selected items deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete some items');
    }
  });

  // Save gallery item mutation
  const saveItemMutation = useMutation({
    mutationFn: async (itemData: Partial<GalleryItem>) => {
      if (selectedItem) {
        const response = await api.put(`/gallery/${selectedItem.id}`, itemData);
        return response.data;
      } else {
        const response = await api.post('/gallery', itemData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      setShowModal(false);
      setSelectedItem(null);
      toast.success(selectedItem ? 'Gallery item updated successfully' : 'Gallery item created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save gallery item');
    }
  });

  // Export gallery items mutation
  const exportGalleryMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get('/gallery/export', {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gallery-items-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Gallery items exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export gallery items');
    }
  });

  // Import gallery items mutation
  const importGalleryMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/gallery/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      toast.success(`Successfully imported ${result.success} gallery items`);
      if (result.errors && result.errors.length > 0) {
        toast.error(`${result.errors.length} items failed to import`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import gallery items');
    }
  });

  // Event handlers

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === galleryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(galleryItems.map((item: GalleryItem) => item.id));
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      bulkDeleteMutation.mutate(selectedItems);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const openModal = (item?: GalleryItem) => {
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleExportGallery = () => {
    exportGalleryMutation.mutate();
  };

  const handleImportGallery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importGalleryMutation.mutate(file);
      // Reset the input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  return (
    <>
      <Helmet>
        <title>Gallery Management - Admin Panel | Mahakal Aqua</title>
        <meta name="description" content="Manage gallery images and project photos" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage project photos and gallery images
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleExportGallery}
              disabled={exportGalleryMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportGalleryMutation.isPending ? 'Exporting...' : 'Export Gallery'}
            </button>
            
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="h-4 w-4 mr-2" />
              {importGalleryMutation.isPending ? 'Importing...' : 'Import Gallery'}
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportGallery}
                disabled={importGalleryMutation.isPending}
                className="hidden"
              />
            </label>
            
            <button
              onClick={() => setShowBulkUpload(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Images
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Images
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.active || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Featured
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.featured || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Views
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalViews || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                {/* Select All */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === galleryItems.length && galleryItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All ({selectedItems.length} selected)
                  </span>
                </label>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                <span className="text-sm text-gray-500">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Items */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No gallery items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading your first image.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item: GalleryItem) => {
                  // Determine category color based on type
                  const getCategoryColor = (category: string) => {
                    const cat = category.toLowerCase();
                    if (cat === 'residential') return 'bg-blue-100 text-blue-800 border-blue-200';
                    if (cat === 'commercial') return 'bg-green-100 text-green-800 border-green-200';
                    if (cat === 'industrial') return 'bg-purple-100 text-purple-800 border-purple-200';
                    return 'bg-gray-100 text-gray-800 border-gray-200';
                  };

                  const categoryColor = getCategoryColor(item.category || '');
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 left-3 z-20">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                        />
                      </div>

                      {/* Category Tag */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${categoryColor}`}>
                          {item.category || 'Other'}
                        </span>
                      </div>

                      {/* Rating Stars */}
                      <div className="absolute top-12 right-3 z-20 flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < (item.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Image */}
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {item.thumbnailUrl || item.imageUrl ? (
                          <img
                            src={item.thumbnailUrl || item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              // Use local SVG placeholder instead of external service
                              (e.target as HTMLImageElement).src = getPlaceholderImage(400, 300, 'No Image');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                        )}
                        {/* Image Overlay on Hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                          {item.description || 'No description available'}
                        </p>
                        
                        {/* Details Section */}
                        <div className="space-y-2 border-t border-gray-100 pt-3">
                          {item.location && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="font-medium mr-1">Location:</span>
                              <span>{item.location}</span>
                            </div>
                          )}
                          {item.projectDate && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="font-medium mr-1">Date:</span>
                              <span>{new Date(item.projectDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            </div>
                          )}
                          {item.client && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="font-medium mr-1">Client:</span>
                              <span>{item.client}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              {item.views || 0}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3.5 w-3.5 mr-1" />
                              {item.likes || 0}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => window.open(item.imageUrl, '_blank')}
                            className="p-3 bg-white rounded-full text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-lg"
                            title="View Full Size"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal(item)}
                            className="p-3 bg-white rounded-full text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-lg"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item.id)}
                            className="p-3 bg-white rounded-full text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-lg"
                            title={item.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {item.isActive ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-3 bg-white rounded-full text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all shadow-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === galleryItems.length && galleryItems.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {galleryItems.map((item: GalleryItem) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.thumbnailUrl || item.imageUrl ? (
                            <img
                              src={item.thumbnailUrl || item.imageUrl}
                              alt={item.title}
                              className="h-12 w-12 rounded-lg object-cover"
                              onError={(e) => {
                                // Use local SVG placeholder instead of external service
                                (e.target as HTMLImageElement).src = getPlaceholderImage(48, 48, 'N/A');
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                            {item.featured && (
                              <Star className="inline-block ml-1 h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {item.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {item.likes}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(item.imageUrl, '_blank')}
                              className="text-gray-400 hover:text-primary-600"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal(item)}
                              className="text-gray-400 hover:text-primary-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              className="text-gray-400 hover:text-primary-600"
                              title={item.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {item.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Item Modal */}
      {showModal && (
        <GalleryModal
          isOpen={showModal}
          onClose={closeModal}
          item={selectedItem}
          onSave={(itemData) => saveItemMutation.mutate(itemData)}
          isLoading={saveItemMutation.isPending}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onComplete={() => {
            setShowBulkUpload(false);
            queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
            queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
          }}
        />
      )}
    </>
  );
};

// Gallery Item Modal Component
interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  onSave: (data: Partial<GalleryItem>) => void;
  isLoading: boolean;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    isActive: true,
    featured: false,
    location: '',
    projectDate: '',
    client: '',
    rating: 5
  });
  
  const [imageData, setImageData] = useState<UploadedImage | null>(null);
  const [tagInput, setTagInput] = useState('');
  
  const { processUploadedImages } = useImageUpload({
    category: 'gallery',
    invalidateQueries: ['gallery-admin', 'gallery-stats']
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || '',
        tags: item.tags || [],
        isActive: item.isActive ?? true,
        featured: item.featured ?? false,
        location: item.location || '',
        projectDate: item.projectDate || '',
        client: item.client || '',
        rating: item.rating || 5
      });
      
      if (item.imageUrl) {
        setImageData({
          id: 'existing',
          url: item.imageUrl,
          name: item.title,
          size: 0,
          type: 'image/jpeg'
        });
      }
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        isActive: true,
        featured: false,
        location: '',
        projectDate: '',
        client: '',
        rating: 5
      });
      setImageData(null);
    }
  }, [item]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!imageData) {
      toast.error('Image is required');
      return;
    }

    try {
      let imageUrl = imageData.url;
      
      // Upload new image if it's a file
      if (imageData.file) {
        const urls = await processUploadedImages([imageData]);
        imageUrl = urls[0];
      }

      const itemData = {
        ...formData,
        imageUrl
      };

      onSave(itemData);
    } catch {
      toast.error('Failed to process image');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {item ? 'Edit Gallery Item' : 'Add Gallery Item'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image *
                  </label>
                  <ImageUpload
                    value={imageData || undefined}
                    onChange={(image) => setImageData(image as UploadedImage)}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                    maxSize={10}
                    placeholder="Upload gallery image"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Enter image title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Enter image description"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleInputChange('rating', star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= formData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.rating} / 5
                    </span>
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(event) => handleInputChange('location', event.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Project location (e.g., Raipur, Ujjain)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Date
                    </label>
                    <input
                      type="date"
                      value={formData.projectDate}
                      onChange={(e) => handleInputChange('projectDate', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client/Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Client or company name"
                  />
                </div>

                {/* Status Toggles */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (item ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultTags, setDefaultTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { processUploadedImages } = useImageUpload({
    category: 'gallery'
  });

  const handleBulkUpload = async () => {
    if (images.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    if (!defaultCategory) {
      toast.error('Please select a default category');
      return;
    }

    setIsUploading(true);

    try {
      // Upload all images
      const uploadedUrls = await processUploadedImages(images);
      
      // Create gallery items for each uploaded image
      const galleryItems = images.map((image, index) => ({
        title: image.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        description: '',
        imageUrl: uploadedUrls[index],
        category: defaultCategory,
        tags: defaultTags,
        isActive: true,
        featured: false
      }));

      // Save all gallery items
      await Promise.all(
        galleryItems.map(item => api.post('/gallery', item))
      );

      toast.success(`${images.length} images uploaded successfully`);
      onComplete();
    } catch {
      toast.error('Failed to upload some images');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Bulk Upload Images
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Default Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Category *
                  </label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={defaultTags.join(', ')}
                    onChange={(e) => setDefaultTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images
                </label>
                <ImageUpload
                  value={images}
                  onChange={(uploadedImages) => {
                    if (Array.isArray(uploadedImages)) {
                      setImages(uploadedImages);
                    } else if (uploadedImages) {
                      setImages([uploadedImages]);
                    } else {
                      setImages([]);
                    }
                  }}
                  multiple
                  maxFiles={20}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxSize={10}
                  placeholder="Upload multiple images"
                  previewSize="sm"
                />
              </div>

              {/* Upload Summary */}
              {images.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Upload Summary
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>Images to upload: {images.length}</p>
                    <p>Default category: {defaultCategory || 'Not selected'}</p>
                    <p>Default tags: {defaultTags.length > 0 ? defaultTags.join(', ') : 'None'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleBulkUpload}
              disabled={isUploading || images.length === 0 || !defaultCategory}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : `Upload ${images.length} Images`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;