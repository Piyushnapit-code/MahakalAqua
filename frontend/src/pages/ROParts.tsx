import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Search,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Grid,
  List,
  SlidersHorizontal,
  Package,
  Truck,
  Shield,
  RefreshCw,
  Heart,
  Eye,
  ArrowRight,
  Phone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import type { ROPart } from '../types';

// Import images for RO parts
import img7 from '../assets/7.jpg';
import img8 from '../assets/8.jpg';
import img9 from '../assets/9.jpg';
import img10 from '../assets/10.jpg';
import img11 from '../assets/11.jpg';
import img12 from '../assets/12.jpg';

// Mock data for RO parts
const mockParts: ROPart[] = [
  {
    _id: '1',
    id: '1',
    name: 'Sediment Filter (5 Micron)',
    description: 'High-quality sediment filter for removing dirt, sand, and rust particles',
    price: 299,
    originalPrice: 399,
    category: 'filters',
    brand: 'AquaPure',
    image: img7,
    inStock: true,
    stockQuantity: 25,
    rating: 4.5,
    reviewCount: 128,
    features: ['5 Micron filtration', 'Long lasting', 'Easy installation', 'Universal fit'],
    specifications: {
      'Filter Type': 'Sediment',
      'Micron Rating': '5',
      'Length': '10 inches',
      'Diameter': '2.5 inches',
      'Life Span': '3-6 months'
    },
    compatibility: ['Most 10" housings'],
    warranty: '6 months',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    id: '2',
    name: 'Carbon Block Filter',
    description: 'Activated carbon filter for chlorine and odor removal',
    price: 449,
    originalPrice: 599,
    category: 'filters',
    brand: 'PureFlow',
    image: img8,
    inStock: true,
    stockQuantity: 18,
    rating: 4.7,
    reviewCount: 95,
    features: ['Chlorine removal', 'Odor elimination', 'Taste improvement', 'NSF certified'],
    specifications: {
      'Filter Type': 'Carbon Block',
      'Chlorine Reduction': '99%',
      'Length': '10 inches',
      'Flow Rate': '2.5 GPM',
      'Life Span': '6-12 months'
    },
    compatibility: ['Standard 10" housings'],
    warranty: '1 year',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    _id: '3',
    id: '3',
    name: 'RO Membrane 75 GPD',
    description: 'High-performance reverse osmosis membrane for pure water',
    price: 1299,
    originalPrice: 1599,
    category: 'membranes',
    brand: 'MemTech',
    image: img9,
    inStock: true,
    stockQuantity: 12,
    rating: 4.8,
    reviewCount: 156,
    features: ['75 GPD capacity', 'TFC membrane', 'High rejection rate', 'Long life'],
    specifications: {
      'Capacity': '75 GPD',
      'Type': 'TFC',
      'Rejection Rate': '96%',
      'Operating Pressure': '60 PSI',
      'Life Span': '2-3 years'
    },
    compatibility: ['Standard RO systems'],
    warranty: '2 years',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    _id: '4',
    id: '4',
    name: 'UV Lamp 11 Watt',
    description: 'Germicidal UV lamp for water sterilization',
    price: 899,
    originalPrice: 1199,
    category: 'uv-parts',
    brand: 'UVTech',
    image: img10,
    inStock: true,
    stockQuantity: 8,
    rating: 4.6,
    reviewCount: 73,
    features: ['11W power', 'Long life', 'High UV output', 'Easy replacement'],
    specifications: {
      'Power': '11 Watts',
      'Length': '287mm',
      'UV Output': '254nm',
      'Life Span': '8000-10000 hours',
      'Base Type': 'G23'
    },
    compatibility: ['11W UV systems'],
    warranty: '1 year',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
  {
    _id: '5',
    id: '5',
    name: 'Booster Pump 24V',
    description: 'High-pressure booster pump for RO systems',
    price: 2499,
    originalPrice: 2999,
    category: 'pumps',
    brand: 'PumpMax',
    image: img11,
    inStock: true,
    stockQuantity: 6,
    rating: 4.4,
    reviewCount: 42,
    features: ['24V DC motor', 'Auto shut-off', 'Quiet operation', 'Durable'],
    specifications: {
      'Voltage': '24V DC',
      'Flow Rate': '50 GPD',
      'Pressure': '80 PSI',
      'Power': '36W',
      'Inlet/Outlet': '1/4" JG'
    },
    compatibility: ['Most RO systems'],
    warranty: '2 years',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    _id: '6',
    id: '6',
    name: 'Storage Tank 3.2 Gallon',
    description: 'Pressurized storage tank for RO water',
    price: 1899,
    originalPrice: 2299,
    category: 'tanks',
    brand: 'TankPro',
    image: img12,
    inStock: false,
    stockQuantity: 0,
    rating: 4.3,
    reviewCount: 67,
    features: ['3.2 gallon capacity', 'Food grade', 'Pre-charged', 'Compact design'],
    specifications: {
      'Capacity': '3.2 Gallons',
      'Material': 'Steel with liner',
      'Connection': '1/4" JG',
      'Pressure': '7-10 PSI',
      'Dimensions': '11" x 15"'
    },
    compatibility: ['Standard RO systems'],
    warranty: '5 years',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z',
  }
];

const categories = [
  { id: 'all', name: 'All Parts', count: 6 },
  { id: 'filters', name: 'Filters', count: 2 },
  { id: 'membranes', name: 'Membranes', count: 1 },
  { id: 'uv-parts', name: 'UV Parts', count: 1 },
  { id: 'pumps', name: 'Pumps', count: 1 },
  { id: 'tanks', name: 'Tanks', count: 1 },
];

const brands = ['All Brands', 'AquaPure', 'PureFlow', 'MemTech', 'UVTech', 'PumpMax', 'TankPro'];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

const features = [
  {
    icon: Package,
    title: 'Genuine Parts',
    description: 'Original and certified RO parts'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same day delivery in local areas'
  },
  {
    icon: Shield,
    title: 'Warranty',
    description: 'Manufacturer warranty on all parts'
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day hassle-free returns'
  }
];

export default function ROParts() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Mock query for parts
  const { data: parts = mockParts, isLoading } = useQuery({
    queryKey: ['ro-parts'],
    queryFn: () => Promise.resolve(mockParts),
  });

  const filteredParts = useMemo(() => {
    let filtered = parts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(part => part.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand !== 'All Brands') {
      filtered = filtered.filter(part => part.brand === selectedBrand);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(part => 
      part.price >= priceRange[0] && part.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [parts, selectedCategory, selectedBrand, searchQuery, priceRange, sortBy]);

  const addToCart = (partId: string) => {
    setCart(prev => ({
      ...prev,
      [partId]: (prev[partId] || 0) + 1
    }));
    toast.success('Added to cart');
  };

  const removeFromCart = (partId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[partId] > 1) {
        newCart[partId]--;
      } else {
        delete newCart[partId];
      }
      return newCart;
    });
  };

  const toggleWishlist = (partId: string) => {
    setWishlist(prev => {
      if (prev.includes(partId)) {
        toast.success('Removed from wishlist');
        return prev.filter(id => id !== partId);
      } else {
        toast.success('Added to wishlist');
        return [...prev, partId];
      }
    });
  };

  const cartItemsCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>RO Parts & Accessories - Filters, Membranes, UV Lamps | Mahakal Aqua</title>
        <meta 
          name="description" 
          content="Buy genuine RO parts and accessories online. Filters, membranes, UV lamps, pumps, and tanks with warranty. Fast delivery and easy returns." 
        />
        <meta 
          name="keywords" 
          content="RO parts, water filter, RO membrane, UV lamp, sediment filter, carbon filter, RO accessories" 
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
              RO Parts &
              <span className="text-primary-600"> Accessories</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-body-lg max-w-3xl mx-auto mb-8"
            >
              Find genuine RO parts and accessories for your water purification system. 
              From filters to membranes, we have everything you need to keep your RO system running perfectly.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="card sticky top-4">
                <div className="card-content">
                  <h3 className="font-semibold mb-4">Filters</h3>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              value={category.id}
                              checked={selectedCategory === category.id}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">({category.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Brands</h4>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full input"
                    >
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedBrand('All Brands');
                      setPriceRange([0, 5000]);
                      setSearchQuery('');
                    }}
                    className="w-full btn-outline btn-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search parts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-outline btn-sm"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </button>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input min-w-[150px]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Showing {filteredParts.length} of {parts.length} parts
                </p>
                {cartItemsCount > 0 && (
                  <div className="flex items-center space-x-2 text-primary-600">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium">{cartItemsCount} items in cart</span>
                  </div>
                )}
              </div>

              {/* Products Grid/List */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredParts.map((part, index) => (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`card group ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    <div className={`${viewMode === 'list' ? 'w-1/3' : ''} relative`}>
                      <img
                        src={part.image}
                        alt={part.name}
                        className={`w-full object-cover rounded-lg ${
                          viewMode === 'list' ? 'h-48' : 'h-64'
                        }`}
                      />
                      {!part.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                      <button
                        onClick={() => toggleWishlist(part.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            wishlist.includes(part.id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </div>
                    
                    <div className={`card-content ${viewMode === 'list' ? 'w-2/3 flex flex-col justify-between' : ''}`}>
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors">
                            {part.name}
                          </h3>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {part.brand}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {part.description}
                        </p>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(part.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            {part.rating || 0} ({part.reviewCount || 0} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-2xl font-bold text-primary-600">
                            {formatCurrency(part.price)}
                          </span>
                          {part.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatCurrency(part.originalPrice)}
                            </span>
                          )}
                          {part.originalPrice && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                              {Math.round((1 - part.price / part.originalPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {part.features?.slice(0, 3).map((feature, i) => (
                            <span
                              key={i}
                              className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {cart[part.id] ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => removeFromCart(part.id)}
                                className="p-1 border rounded hover:bg-gray-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="font-medium">{cart[part.id]}</span>
                              <button
                                onClick={() => addToCart(part.id)}
                                className="p-1 border rounded hover:bg-gray-50"
                                disabled={!part.inStock}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(part.id)}
                              disabled={!part.inStock}
                              className="btn-primary btn-sm"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                        
                        <button className="p-2 text-gray-400 hover:text-primary-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {part.inStock && part.stockQuantity <= 5 && (
                        <p className="text-orange-600 text-sm mt-2">
                          Only {part.stockQuantity} left in stock!
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredParts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No parts found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedBrand('All Brands');
                      setPriceRange([0, 5000]);
                      setSearchQuery('');
                    }}
                    className="btn-primary"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container">
          <div className="text-center">
            <h2 className="heading-2 mb-4 text-white">
              Need Help Finding the Right Part?
            </h2>
            <p className="text-body-lg mb-8 text-primary-100 max-w-3xl mx-auto">
              Our experts can help you identify the right parts for your RO system. 
              Get professional advice and ensure compatibility.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-secondary btn-lg">
                <Phone className="mr-2 h-5 w-5" />
                Call Expert
              </button>
              <button className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600">
                Chat Support
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}