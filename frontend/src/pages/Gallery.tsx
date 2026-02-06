import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Grid,
  List,
  MapPin,
  Calendar,
  User,
  Star,
  Camera
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { GalleryItem } from '../data/galleryData';

// Category definitions without counts (will be computed dynamically)
const CATEGORY_DEFINITIONS = [
  { id: 'all', name: 'All Projects' },
  { id: 'residential', name: 'Residential' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'industrial', name: 'Industrial' },
  { id: 'Installation', name: 'Installation' },
  { id: 'Maintenance', name: 'Maintenance' },
  { id: 'Repair', name: 'Repair' },
  { id: 'Testing', name: 'Testing' },
  { id: 'Parts', name: 'Parts' },
  { id: 'Customers', name: 'Customers' },
  { id: 'Team', name: 'Our Team' },
  { id: 'Before/After', name: 'Before/After' }
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch gallery items from API
  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const response = await api.get('/gallery');
      const items = response.data?.data?.items || [];
      
      // Transform API response to match GalleryItem interface
      return items
        .filter((item: any) => item.isActive) // Only show active items
        .map((item: any) => {
          const imageUrl = item.image?.url || item.imageUrl || '';
          // Ensure image URL is absolute
          let fullImageUrl = imageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            const apiUrl = import.meta.env.VITE_API_URL;
            if (!apiUrl) throw new Error('VITE_API_URL environment variable is required');
            const baseUrl = apiUrl.replace('/api', ''); // Remove /api to get base URL
            fullImageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
          
          return {
            id: item._id || item.id,
            title: item.title || 'Untitled',
            description: item.description || '',
            imageUrl: fullImageUrl,
            thumbnailUrl: fullImageUrl,
            category: item.category || item.projectType || 'other',
            tags: item.tags || [],
            rating: item.rating || 0,
            views: item.views || 0,
            likes: item.likes || 0,
            location: item.location || '',
            date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            customerName: item.client || ''
          } as GalleryItem;
        });
    },
  });

  const galleryItems = galleryData || [];

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter((item: any) => item.category === selectedCategory);

  // Compute category counts dynamically from API data
  const categoriesWithCounts = CATEGORY_DEFINITIONS.map(category => ({
    ...category,
    count: category.id === 'all' 
      ? galleryItems.length 
      : galleryItems.filter((item: any) => item.category === category.id).length
  }));

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
    setCurrentImageIndex(filteredItems.findIndex((i: any) => i.id === item.id));
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentImageIndex - 1 + filteredItems.length) % filteredItems.length
      : (currentImageIndex + 1) % filteredItems.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredItems[newIndex]);
  }, [currentImageIndex, filteredItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentImageIndex, navigateImage]);

  return (
    <>
      <Helmet>
        <title>Project Gallery - RO Installation & Maintenance Projects | Mahakal Aqua</title>
        <meta 
          name="description" 
          content="View our portfolio of successful RO installation and maintenance projects. Residential, commercial, and industrial water purification solutions." 
        />
        <meta 
          name="keywords" 
          content="RO installation gallery, water purifier projects, residential RO, commercial RO, industrial water treatment" 
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="container">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="heading-1 mb-6"
            >
              Our Project
              <span className="text-primary-600"> Gallery</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-body-lg max-w-3xl mx-auto mb-8"
            >
              Explore our portfolio of successful water purification projects across residential, 
              commercial, and industrial sectors. See the quality of our work and customer satisfaction.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center space-x-6 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-primary-600" />
                <span>{galleryItems.length}+ Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>5.0 Average Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {filteredItems.length} projects
                </span>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 aspect-[4/3] rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-8'
              }
            >
              <AnimatePresence>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={
                        viewMode === 'grid'
                          ? 'group cursor-pointer'
                          : 'flex flex-col md:flex-row gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                      }
                      onClick={() => openLightbox(item)}
                    >
                    <div className={viewMode === 'grid' ? 'relative overflow-hidden rounded-lg' : 'md:w-1/3'}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={
                          viewMode === 'grid'
                            ? 'w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300'
                            : 'w-full aspect-[4/3] object-cover rounded-lg'
                        }
                      />
                      {viewMode === 'grid' && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={viewMode === 'grid' ? 'mt-4' : 'md:w-2/3'}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>

                      <h3 className={`font-semibold mb-2 ${viewMode === 'grid' ? 'text-lg' : 'text-xl'}`}>
                        {item.title}
                      </h3>
                      
                      <p className={`text-gray-600 mb-3 ${viewMode === 'grid' ? 'text-sm' : 'text-base'}`}>
                        {item.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{item.customerName}</span>
                        </div>
                      </div>

                      {viewMode === 'list' && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {item.tags.map((tag: any, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                  ))
                ) : null}
              </AnimatePresence>
              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</h3>
                  <p className="text-gray-600">Try selecting a different category or check back later for new projects.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              >
                <X className="h-8 w-8" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              {/* Image */}
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              {/* Image Info */}
              <div className="bg-white p-6 rounded-b-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                    {selectedImage.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(selectedImage.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedImage.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedImage.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{selectedImage.customerName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedImage.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentImageIndex + 1} / {filteredItems.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}