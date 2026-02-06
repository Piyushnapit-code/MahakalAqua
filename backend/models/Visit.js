const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true,
    trim: true
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    os: {
      type: String,
      default: 'Unknown'
    }
  },
  path: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  referrer: {
    type: String,
    trim: true,
    default: 'direct'
  },
  location: {
    country: String,
    city: String,
    state: String,
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    accuracy: Number, // GPS accuracy in meters
    address: String,
    timezone: String
  },
  contactInfo: {
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          // Remove spaces, dashes, and parentheses; validate international-style numbers
          return !v || /^\+?[1-9]\d{0,15}$/.test(v.replace(/[\s-()]/g, ''));
        },
        message: 'Invalid phone number format'
      }
    },
    countryCode: String,
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    consentGiven: {
      type: Boolean,
      default: false
    },
    consentTimestamp: Date
  },
  language: {
    type: String,
    trim: true,
    lowercase: true
  },
  isNewVisitor: {
    type: Boolean,
    default: true
  },
  visitCount: {
    type: Number,
    default: 1,
    min: 1
  },
  pageViews: {
    type: Number,
    default: 1,
    min: 1
  },
  trafficSource: {
    type: String,
    enum: ['direct', 'organic', 'social', 'referral', 'email', 'paid', 'other'],
    default: 'direct'
  },
  isBot: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Essential indexes only
visitSchema.index({ sessionId: 1, createdAt: -1 });
visitSchema.index({ ipAddress: 1, createdAt: -1 });
visitSchema.index({ path: 1, createdAt: -1 });
visitSchema.index({ trafficSource: 1, createdAt: -1 });
visitSchema.index({ device: 1, createdAt: -1 });
visitSchema.index({ isBot: 1, createdAt: -1 });
visitSchema.index({ lastActivity: -1 });
visitSchema.index({ createdAt: -1 });
visitSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index for location queries
visitSchema.index({ 'contactInfo.phoneNumber': 1 });
visitSchema.index({ 'contactInfo.consentGiven': 1, createdAt: -1 });

// Simple methods
visitSchema.statics.getActiveVisits = function() {
  return this.find({ isActive: true });
};

visitSchema.statics.getVisitsByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    isBot: false
  }).sort({ createdAt: -1 });
};

// Get visitors with contact information
visitSchema.statics.getVisitorsWithContact = function() {
  return this.find({
  'contactInfo.phoneNumber': { $exists: true, $nin: [null, ''] },
    'contactInfo.consentGiven': true,
    isBot: false
  }).sort({ createdAt: -1 });
};

// Get visitors by location radius
visitSchema.statics.getVisitorsByLocation = function(longitude, latitude, radiusInKm = 10) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    isBot: false
  }).sort({ createdAt: -1 });
};

// Update visitor contact information
visitSchema.methods.updateContactInfo = function(phoneNumber, countryCode, consentGiven = true) {
  this.contactInfo = {
    phoneNumber: phoneNumber,
    countryCode: countryCode,
    consentGiven: consentGiven,
    consentTimestamp: new Date(),
    isPhoneVerified: false
  };
  return this.save();
};

// Update visitor location
visitSchema.methods.updateLocation = function(locationData) {
  if (locationData.latitude && locationData.longitude) {
    this.location = {
      ...this.location,
      ...locationData,
      coordinates: {
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }
    };
  }
  return this.save();
};

module.exports = mongoose.model('Visit', visitSchema);