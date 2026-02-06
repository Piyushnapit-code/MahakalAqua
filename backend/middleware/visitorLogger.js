const Visit = require('../models/Visit');
const UAParser = require('ua-parser-js');

// Middleware to log visitor information
const logVisitor = async (req, res, next) => {
  try {
    // Skip logging for API routes, admin routes, and static files
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/admin/') || 
        req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return next();
    }

    const sessionId = req.sessionID || req.session?.id || generateSessionId();
    const ipAddress = getClientIP(req);
    const userAgent = req.get('User-Agent') || 'Unknown';
    const device = detectDevice(userAgent);
    const path = req.path;
    const referrer = req.get('Referer') || 'direct';
    const language = req.get('Accept-Language')?.split(',')[0]?.toLowerCase() || 'en';
    
    // Check for cookie consent
    const cookieConsent = req.cookies?.cookieConsent === 'true';
    
    // Get location data from request body or headers (if provided by frontend)
    const locationData = req.body?.location || req.headers['x-location-data'] ? 
      JSON.parse(req.headers['x-location-data']) : null;
    
    // Get or create session
    if (!req.session.visitId) {
      // Check if this is a returning visitor
      const existingVisit = await Visit.findOne({
        ipAddress: ipAddress,
        userAgent: userAgent
      }).sort({ createdAt: -1 });

      const isNewVisitor = !existingVisit;
      const visitCount = existingVisit ? existingVisit.visitCount + 1 : 1;

      // Prepare visit data
      const visitData = {
        sessionId,
        ipAddress,
        userAgent,
        device,
        path,
        referrer,
        language,
        isNewVisitor,
        visitCount,
        cookieConsent
      };

      // Add location data if available and consent given
      if (locationData && cookieConsent) {
        visitData.location = {
          country: locationData.country,
          city: locationData.city,
          state: locationData.state,
          address: locationData.address,
          timezone: locationData.timezone
        };

        // Add coordinates if available
        if (locationData.latitude && locationData.longitude) {
          visitData.location.coordinates = {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          };
          visitData.location.accuracy = locationData.accuracy;
        }
      }

      // Create new visit record
      const visit = new Visit(visitData);
      await visit.save();
      req.session.visitId = visit._id;
      req.session.save();
    } else {
      // Update existing visit
      const updateData = {
        $inc: { pageViews: 1 },
        $set: { 
          lastActivity: new Date(),
          path: path // Update current path
        }
      };

      // Update location if new data is provided and consent given
      if (locationData && cookieConsent) {
        updateData.$set.location = {
          country: locationData.country,
          city: locationData.city,
          state: locationData.state,
          address: locationData.address,
          timezone: locationData.timezone
        };

        if (locationData.latitude && locationData.longitude) {
          updateData.$set['location.coordinates'] = {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          };
          updateData.$set['location.accuracy'] = locationData.accuracy;
        }
      }

      await Visit.findByIdAndUpdate(req.session.visitId, updateData);
    }

    next();
  } catch (error) {
    console.error('Error logging visitor:', error);
    next(); // Continue even if logging fails
  }
};

// Middleware to track conversion goals
const trackConversion = (goalType) => {
  return async (req, res, next) => {
    try {
      const sessionId = req.sessionID || generateSessionId(req);
      
      const visit = await Visit.findOne({
        sessionId,
        isActive: true
      });

      if (visit) {
        await visit.addConversionGoal(goalType, req.body?.goalValue);
      }

      next();
    } catch (error) {
      console.error('Conversion tracking error:', error);
      next();
    }
  };
};

// Middleware to update session activity
const updateActivity = async (req, res, next) => {
  try {
    const sessionId = req.sessionID || generateSessionId(req);
    
    const visit = await Visit.findOne({
      sessionId,
      isActive: true
    });

    if (visit) {
      await visit.updateSessionDuration();
    }

    next();
  } catch (error) {
    console.error('Activity update error:', error);
    next();
  }
};

// Helper function to get client IP
function getClientIP(req) {
  // Try multiple methods to get real IP
  let ip = req.ip ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           req.headers['x-real-ip'] ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['cf-connecting-ip'] || // Cloudflare
           req.headers['x-client-ip'] ||
           'unknown';
  
  // Handle IPv6 localhost (::1) - convert to IPv4 localhost for display
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1 (localhost)';
  }
  
  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  
  return ip;
}

// Helper function to generate session ID
function generateSessionId(req) {
  const ip = getClientIP(req);
  const userAgent = req.get('User-Agent') || '';
  const timestamp = Date.now();
  
  return require('crypto')
    .createHash('md5')
    .update(`${ip}-${userAgent}-${timestamp}`)
    .digest('hex');
}

// Helper function to check if tracking is essential
function isEssentialTracking(req) {
  // Essential tracking for security and functionality
  const essentialPaths = [
    '/api/auth',
    '/api/admin',
    '/api/contact',
    '/api/enquiry',
    '/api/issue'
  ];
  
  return essentialPaths.some(path => req.path.startsWith(path));
}

// Helper function to parse cookie preferences
function parseCookiePreferences(cookies) {
  const preferences = {
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    functional: false
  };

  if (cookies?.cookiePreferences) {
    try {
      const parsed = JSON.parse(cookies.cookiePreferences);
      return { ...preferences, ...parsed };
    } catch (error) {
      console.error('Error parsing cookie preferences:', error);
    }
  }

  return preferences;
}

// Middleware to handle cookie consent
const handleCookieConsent = (req, res, next) => {
  // Set cookie consent from request body
  if (req.body.cookieConsent !== undefined) {
    res.cookie('cookieConsent', req.body.cookieConsent, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  // Set cookie preferences
  if (req.body.cookiePreferences) {
    res.cookie('cookiePreferences', JSON.stringify(req.body.cookiePreferences), {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  next();
};

// Middleware to clean up inactive sessions
const cleanupSessions = async () => {
  try {
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    
    await Visit.updateMany(
      {
        isActive: true,
        lastActivity: { $lt: cutoffTime }
      },
      {
        $set: { isActive: false }
      }
    );
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

// Schedule session cleanup every 10 minutes
setInterval(cleanupSessions, 10 * 60 * 1000);

// Analytics helper functions
const getVisitorStats = async (dateRange = {}) => {
  try {
    const analytics = await Visit.getAnalytics(dateRange);
    return analytics[0] || {
      totalVisits: 0,
      uniqueVisitors: 0,
      totalPageViews: 0,
      avgSessionDuration: 0,
      bounceRate: 0
    };
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return null;
  }
};

const getTopPages = async (limit = 10, dateRange = {}) => {
  try {
    return await Visit.getTopPages(limit, dateRange);
  } catch (error) {
    console.error('Error getting top pages:', error);
    return [];
  }
};

const getTrafficSources = async (dateRange = {}) => {
  try {
    return await Visit.getTrafficSources(dateRange);
  } catch (error) {
    console.error('Error getting traffic sources:', error);
    return [];
  }
};

// Update visitor location
const updateVisitorLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy, address, city, state, country, timezone } = req.body;
    const visitId = req.session?.visitId;

    if (!visitId) {
      return res.status(400).json({ error: 'No active session found' });
    }

    // Check for cookie consent
    const cookieConsent = req.cookies?.cookieConsent === 'true';
    if (!cookieConsent) {
      return res.status(403).json({ error: 'Location tracking requires cookie consent' });
    }

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({ error: 'Visit session not found' });
    }

    // Update location data
    const locationData = {
      country,
      city,
      state,
      address,
      timezone
    };

    if (latitude && longitude) {
      locationData.coordinates = { latitude, longitude };
      locationData.accuracy = accuracy;
    }

    await visit.updateLocation(locationData);

    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating visitor location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// Update visitor contact information
const updateVisitorContact = async (req, res, next) => {
  try {
    const { phoneNumber, countryCode, consentGiven } = req.body;
    const visitId = req.session?.visitId;

    if (!visitId) {
      return res.status(400).json({ error: 'No active session found' });
    }

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({ error: 'Visit session not found' });
    }

    // Update contact information
    await visit.updateContactInfo(phoneNumber, countryCode, consentGiven);

    res.json({ success: true, message: 'Contact information updated successfully' });
  } catch (error) {
    console.error('Error updating visitor contact:', error);
    res.status(500).json({ error: 'Failed to update contact information' });
  }
};

// Get visitors with contact information (admin only)
const getVisitorsWithContact = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {
  'contactInfo.phoneNumber': { $exists: true, $nin: [null, ''] },
      'contactInfo.consentGiven': true,
      isBot: false
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { 'contactInfo.phoneNumber': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const visitors = await Visit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId ipAddress contactInfo location device createdAt lastActivity pageViews visitCount');

    const total = await Visit.countDocuments(query);

    res.json({
      visitors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting visitors with contact:', error);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
};

// Helper function to detect device type using UAParser
function detectDevice(userAgent) {
  if (!userAgent || userAgent === 'Unknown') {
    return {
      type: 'unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
  }
  
  try {
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getDevice();
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    
    // Determine device type
    let deviceType = 'desktop';
    if (deviceInfo.type) {
      deviceType = deviceInfo.type;
    } else {
      const ua = userAgent.toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceType = 'mobile';
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'tablet';
      }
    }
    
    return {
      type: deviceType,
      browser: browserInfo.name || 'Unknown',
      os: osInfo.name || 'Unknown'
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
    return {
      type: 'unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
  }
}

module.exports = {
  logVisitor,
  trackConversion,
  updateActivity,
  handleCookieConsent,
  cleanupSessions,
  getVisitorStats,
  getTopPages,
  getTrafficSources,
  updateVisitorLocation,
  updateVisitorContact,
  getVisitorsWithContact
};