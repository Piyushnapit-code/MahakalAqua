const mongoose = require('mongoose');

const issueRequestSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  customerPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  issueType: {
    type: String,
    required: [true, 'Issue type is required'],
    enum: ['no_water_flow', 'poor_water_quality', 'leakage', 'noise', 'electrical_issue', 'filter_replacement', 'maintenance', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  systemType: {
    type: String,
    enum: ['ro', 'uv', 'uf', 'water_cooler', 'dispenser', 'other'],
    required: [true, 'System type is required']
  },
  status: {
    type: String,
    enum: ['new', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled'],
    default: 'new'
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
issueRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TICKET-${Date.now()}-${count + 1}`;
  }
  next();
});

// Essential indexes only
issueRequestSchema.index({ customerPhone: 1 });
issueRequestSchema.index({ status: 1, createdAt: -1 });
issueRequestSchema.index({ priority: 1, status: 1 });
issueRequestSchema.index({ assignedTo: 1, status: 1 });
issueRequestSchema.index({ isEmergency: 1, status: 1 });

// Simple methods
issueRequestSchema.methods.assignTechnician = function(technicianId) {
  this.assignedTo = technicianId;
  if (this.status === 'new') {
    this.status = 'assigned';
  }
  return this.save();
};

issueRequestSchema.methods.resolveIssue = function(resolution) {
  this.status = 'resolved';
  this.resolution = resolution;
  return this.save();
};

module.exports = mongoose.model('IssueRequest', issueRequestSchema);