const mongoose = require('mongoose');

const roPartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true,
    maxlength: [100, 'Part name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['filter', 'membrane', 'pump', 'valve', 'tank', 'pipe', 'electrical', 'other'],
    default: 'other'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  image: {
    filename: String,
    url: String
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Essential indexes only
roPartSchema.index({ category: 1, isActive: 1 });
roPartSchema.index({ inStock: 1, isActive: 1 });
roPartSchema.index({ createdAt: -1 });

// Simple methods
roPartSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

roPartSchema.statics.findInStock = function() {
  return this.find({ inStock: true, isActive: true });
};

module.exports = mongoose.model('ROPart', roPartSchema);