const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
      'Before/After',
      'installation',
      'maintenance',
      'repair',
      'testing',
      'parts',
      'customers',
      'team',
      'before-after',
      'before/after',
      'product',
      'other'
    ],
    default: 'other'
  },
  image: {
    filename: String,
    url: String,
    alt: String
  },
  tags: {
    type: [String],
    default: []
  },
  projectType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial'],
    default: 'residential'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  client: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  projectDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Essential indexes only
galleryItemSchema.index({ category: 1, isActive: 1 });
galleryItemSchema.index({ featured: 1, isActive: 1 });
galleryItemSchema.index({ displayOrder: 1, createdAt: -1 });

// Simple methods
galleryItemSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
};

galleryItemSchema.statics.findFeatured = function() {
  return this.find({ featured: true, isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
};

module.exports = mongoose.model('GalleryItem', galleryItemSchema);