const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  contactType: {
    type: String,
    enum: ['general', 'service_inquiry', 'support', 'complaint', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Essential indexes only
contactRequestSchema.index({ status: 1, createdAt: -1 });
contactRequestSchema.index({ isRead: 1, createdAt: -1 });
contactRequestSchema.index({ email: 1 });

// Simple methods
contactRequestSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

contactRequestSchema.methods.resolve = function(resolution) {
  this.status = 'resolved';
  this.resolution = resolution;
  return this.save();
};

module.exports = mongoose.model('ContactRequest', contactRequestSchema);