import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  List,
  Grid
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useImageUpload, type UploadedImage } from '../../hooks/useImageUpload';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  specifications: Record<string, string>;
  rating: number;
  totalReviews: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface ProductFilters {
  search: string;
  category: string;
  brand: string;
  status: string;
  stockStatus: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ProductModal Component
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 0,
    maxStock: 0,
    isActive: true,
    isFeatured: false,
    images: [] as string[],
    specifications: {} as Record<string, string>,
    tags: [] as string[],
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 }
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imageData, setImageData] = useState<UploadedImage[]>([]);

  const { processUploadedImages } = useImageUpload({
    category: 'parts',
    invalidateQueries: ['products']
  });

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        sku: product.sku,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        minStock: product.minStock,
        maxStock: product.maxStock,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: product.images,
        specifications: product.specifications,
        tags: product.tags,
        weight: product.weight,
        dimensions: product.dimensions
      });
      
      // Convert existing images to UploadedImage format
      const existingImages: UploadedImage[] = product.images.map((url, index) => ({
        id: `existing-${index}`,
        url,
        name: `Product Image ${index + 1}`,
        size: 0,
        type: 'image/jpeg'
      }));
      setImageData(existingImages);
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        brand: '',
        sku: '',
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 0,
        maxStock: 0,
        isActive: true,
        isFeatured: false,
        images: [],
        specifications: {},
        tags: [],
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 }
      });
      setImageData([]);
    }
  }, [product]);



  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [newSpecKey]: newSpecValue }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Process uploaded images
      const imageUrls = await processUploadedImages(imageData);
      
      const productData = {
        ...formData,
        images: imageUrls,
        rating: product?.rating || 0,
        totalReviews: product?.totalReviews || 0,
        totalSales: product?.totalSales || 0
      };
      
      onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Membranes">Membranes</option>
                <option value="Filters">Filters</option>
                <option value="UV Components">UV Components</option>
                <option value="Tanks">Tanks</option>
                <option value="Pumps">Pumps</option>
                <option value="Fittings">Fittings</option>
                <option value="Electrical">Electrical</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pricing and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stock Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.length}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.width}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.height}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <ImageUpload
              value={imageData}
              onChange={(images) => {
                if (Array.isArray(images)) {
                  setImageData(images);
                } else if (images) {
                  setImageData([images]);
                } else {
                  setImageData([]);
                }
              }}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              maxSize={5}
              multiple={true}
              placeholder="Upload product images"
            />
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specifications
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Specification name"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Specification value"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">
                    <strong>{key}:</strong> {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    brand: '',
    status: '',
    stockStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const queryClient = useQueryClient();

  // Add mutation for creating/updating products
  const saveProductMutation = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (selectedProduct) {
        // Update existing product
        await api.put(`/products/${selectedProduct.id}`, productData);
      } else {
        // Create new product
        await api.post('/products', productData);
      }
    },
    onSuccess: () => {
      toast.success(selectedProduct ? 'Product updated successfully' : 'Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductModal(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to create product');
    },
  });

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveProductMutation.mutate(productData);
  };

  // Mock data - replace with actual API call
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'RO Membrane 75 GPD',
          description: 'High-quality reverse osmosis membrane for water purification',
          category: 'Membranes',
          brand: 'Aqua Pro',
          sku: 'AP-MEM-75',
          price: 1200,
          costPrice: 800,
          stock: 45,
          minStock: 10,
          maxStock: 100,
          isActive: true,
          isFeatured: true,
          images: ['/images/ro-membrane.jpg'],
          specifications: {
            'Flow Rate': '75 GPD',
            'Material': 'TFC',
            'Size': '12" x 2"',
            'Life': '1-2 years'
          },
          rating: 4.5,
          totalReviews: 28,
          totalSales: 150,
          createdAt: '2023-01-15',
          updatedAt: '2024-01-10',
          tags: ['membrane', 'ro', 'filtration'],
          weight: 0.5,
          dimensions: { length: 30, width: 5, height: 5 }
        },
        {
          id: '2',
          name: 'Pre Filter Cartridge',
          description: 'Sediment pre-filter cartridge for water purifiers',
          category: 'Filters',
          brand: 'Pure Water',
          sku: 'PW-PRE-001',
          price: 250,
          costPrice: 150,
          stock: 8,
          minStock: 15,
          maxStock: 50,
          isActive: true,
          isFeatured: false,
          images: ['/images/pre-filter.jpg'],
          specifications: {
            'Micron Rating': '5 micron',
            'Material': 'Polypropylene',
            'Size': '10" x 2.5"',
            'Life': '3-6 months'
          },
          rating: 4.2,
          totalReviews: 15,
          totalSales: 200,
          createdAt: '2023-02-01',
          updatedAt: '2024-01-08',
          tags: ['filter', 'sediment', 'pre-filter'],
          weight: 0.3,
          dimensions: { length: 25, width: 6, height: 6 }
        },
        {
          id: '3',
          name: 'UV Lamp 11W',
          description: 'UV sterilization lamp for water purifiers',
          category: 'UV Components',
          brand: 'UV Tech',
          sku: 'UV-LAMP-11W',
          price: 800,
          costPrice: 500,
          stock: 0,
          minStock: 5,
          maxStock: 25,
          isActive: false,
          isFeatured: false,
          images: ['/images/uv-lamp.jpg'],
          specifications: {
            'Power': '11W',
            'Type': 'UV-C',
            'Life': '8000-10000 hours',
            'Wavelength': '254 nm'
          },
          rating: 4.7,
          totalReviews: 12,
          totalSales: 80,
          createdAt: '2023-03-01',
          updatedAt: '2024-01-05',
          tags: ['uv', 'lamp', 'sterilization'],
          weight: 0.2,
          dimensions: { length: 30, width: 2, height: 2 }
        },
        {
          id: '4',
          name: 'Storage Tank 12L',
          description: 'Plastic storage tank for RO water purifiers',
          category: 'Tanks',
          brand: 'Tank Pro',
          sku: 'TP-TANK-12L',
          price: 1500,
          costPrice: 1000,
          stock: 25,
          minStock: 5,
          maxStock: 30,
          isActive: true,
          isFeatured: true,
          images: ['/images/storage-tank.jpg'],
          specifications: {
            'Capacity': '12 Liters',
            'Material': 'Food Grade Plastic',
            'Color': 'Blue',
            'Warranty': '2 years'
          },
          rating: 4.3,
          totalReviews: 35,
          totalSales: 120,
          createdAt: '2023-04-01',
          updatedAt: '2024-01-12',
          tags: ['tank', 'storage', 'plastic'],
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 40 }
        }
      ];

      return mockProducts;
    },
  });

  const toggleProductStatusMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      await api.patch(`/products/${productId}/status`, { isActive });
    },
    onSuccess: () => {
      toast.success('Product status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Failed to update product status');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  const handleToggleProductStatus = (productId: string, currentStatus: boolean) => {
    toggleProductStatusMutation.mutate({ productId, isActive: !currentStatus });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleExportProducts = () => {
    toast.success('Exporting products data...');
    // Implement export functionality
  };

  const handleImportProducts = () => {
    toast('Import functionality coming soon');
    // Implement import functionality
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800', icon: XCircle };
    if (product.stock <= product.minStock) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const getStockTrend = () => {
    // Mock trend calculation
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalCostValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);

  return (
    <>
      <Helmet>
        <title>Products - Admin Dashboard</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product inventory and catalog
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleImportProducts}
              className="btn-secondary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleExportProducts}
              className="btn-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowProductModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalValue > 0 ? Math.round(((totalValue - totalCostValue) / totalValue) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="space-y-3">
            {outOfStockProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800">
                      Out of Stock Alert
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's are' : ' is'} out of stock: {' '}
                      {outOfStockProducts.map(p => p.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {lowStockProducts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Low Stock Warning
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's have' : ' has'} low stock: {' '}
                      {lowStockProducts.map(p => `${p.name} (${p.stock})`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-1 items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                      viewMode === 'table'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    title="Table View"
                  >
                    <List className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="totalSales">Sales</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn-secondary"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="input"
                    >
                      <option value="">All Categories</option>
                      <option value="Membranes">Membranes</option>
                      <option value="Filters">Filters</option>
                      <option value="UV Components">UV Components</option>
                      <option value="Tanks">Tanks</option>
                      <option value="Pumps">Pumps</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="input"
                    >
                      <option value="">All Brands</option>
                      <option value="Aqua Pro">Aqua Pro</option>
                      <option value="Pure Water">Pure Water</option>
                      <option value="UV Tech">UV Tech</option>
                      <option value="Tank Pro">Tank Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Status
                    </label>
                    <select
                      value={filters.stockStatus}
                      onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                      className="input"
                    >
                      <option value="">All Stock</option>
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Products Table/Grid */}
        <div className="card">
          <div className="card-content p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const TrendIcon = getStockTrend();
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={product.images[0]}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {product.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(product.price)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Cost: {formatCurrency(product.costPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                <stockStatus.icon className="h-3 w-3 mr-1" />
                                {product.stock}
                              </span>
                              <TrendIcon className="h-4 w-4 ml-2 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <ShoppingCart className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm text-gray-900">{product.totalSales}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                              className={`flex items-center ${
                                product.isActive ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              {product.isActive ? (
                                <ToggleRight className="h-6 w-6" />
                              ) : (
                                <ToggleLeft className="h-6 w-6" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowProductModal(true);
                                }}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowProductModal(true);
                                }}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    
                    return (
                      <div key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            className="w-full h-32 sm:h-48 object-cover"
                            src={product.images[0]}
                            alt={product.name}
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                              className={`p-1 rounded-full ${
                                product.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {product.isActive ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {product.isFeatured && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                Featured
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 sm:p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {product.brand} • {product.sku}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-gray-300"
                            />
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(product.price)}
                              </span>
                              <div className="flex items-center">
                                {getRatingStars(product.rating)}
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                  ({product.totalReviews})
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                <stockStatus.icon className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">{product.stock} in stock</span>
                                <span className="sm:hidden">{product.stock}</span>
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {product.totalSales} sold
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 sm:mt-4 flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductModal(true);
                              }}
                              className="flex-1 btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">View</span>
                              <span className="sm:hidden">View</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductModal(true);
                              }}
                              className="flex-1 btn-primary text-xs sm:text-sm py-1.5 sm:py-2"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                              <span className="sm:hidden">Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add ProductModal component */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </>
  );
}