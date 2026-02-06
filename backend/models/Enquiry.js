const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
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
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['installation', 'maintenance', 'repair', 'upgrade', 'ro_installation', 'ro_maintenance', 'ro_repair', 'water_testing', 'consultation', 'other']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  urgency: {
    type: String,
    enum: ['immediate', 'within_week', 'within_month', 'flexible'],
    default: 'flexible'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'site_visit_scheduled', 'quote_sent', 'confirmed', 'completed', 'cancelled'],
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
  estimatedValue: {
    type: Number,
    min: [0, 'Estimated value cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  preferredDate: {
    type: String,
    trim: true
  },
  preferredTime: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Essential indexes only
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ isRead: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ phone: 1 });
enquirySchema.index({ 'address.pincode': 1 });

// Simple methods
enquirySchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

enquirySchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Enquiry', enquirySchema);