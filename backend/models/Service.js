const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['installation', 'maintenance', 'repair', 'consultation', 'emergency', 'other'],
    default: 'other'
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number, // in hours
    min: [0, 'Duration cannot be negative']
  },
  image: {
    filename: String,
    url: String
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature cannot exceed 100 characters']
  }],
  serviceAreas: [{
    type: String,
    trim: true,
    maxlength: [50, 'Service area cannot exceed 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Essential indexes only
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ featured: 1, isActive: 1 });
serviceSchema.index({ createdAt: -1 });

// Simple methods
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

serviceSchema.statics.findFeatured = function() {
  return this.find({ featured: true, isActive: true });
};

module.exports = mongoose.model('Service', serviceSchema);