const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const UAParser = require('ua-parser-js');
const { 
  updateVisitorLocation, 
  updateVisitorContact, 
  getVisitorsWithContact 
} = require('../middleware/visitorLogger');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Simple test route
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({ success: true, message: 'Visitor route test successful' });
});

// Track initial visitor with consent
router.post('/track', async (req, res) => {
  console.log('🎯 Track route hit!', req.method, req.path);
  try {
    const { consent, timestamp, userAgent, language, path, referrer } = req.body;
    
    // Get client IP with proper handling
    let ipAddress = req.ip || 
                    req.connection?.remoteAddress || 
                    req.socket?.remoteAddress || 
                    (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['cf-connecting-ip'] ||
                    'unknown';
    
    // Handle IPv6 localhost
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1 (localhost)';
    }
    
    // Remove IPv6 prefix if present
    if (ipAddress.startsWith('::ffff:')) {
      ipAddress = ipAddress.replace('::ffff:', '');
    }
    
    // Parse user agent properly
    let device = {
      type: 'unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
    
    if (userAgent && userAgent !== 'Unknown') {
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
        
        device = {
          type: deviceType,
          browser: browserInfo.name || 'Unknown',
          os: osInfo.name || 'Unknown'
        };
      } catch (error) {
        console.error('Error parsing user agent:', error);
      }
    }
    
    // Generate session ID if not exists
    const sessionId = req.sessionID || req.session?.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this is a returning visitor by sessionId or IP+UserAgent
    let existingVisit = null;
    if (sessionId && sessionId !== 'session_') {
      existingVisit = await Visit.findOne({ sessionId }).sort({ createdAt: -1 });
    }
    
    if (!existingVisit) {
      existingVisit = await Visit.findOne({
        ipAddress: ipAddress,
        userAgent: userAgent
      }).sort({ createdAt: -1 });
    }

    const isNewVisitor = !existingVisit;
    const visitCount = existingVisit ? (existingVisit.visitCount || 0) + 1 : 1;

    // Determine traffic source
    let trafficSource = 'direct';
    if (referrer && referrer !== 'direct') {
      try {
        const referrerUrl = new URL(referrer);
        const hostname = referrerUrl.hostname.toLowerCase();
        if (hostname.includes('google') || hostname.includes('bing') || hostname.includes('yahoo')) {
          trafficSource = 'organic';
        } else if (hostname.includes('facebook') || hostname.includes('twitter') || hostname.includes('instagram') || hostname.includes('linkedin')) {
          trafficSource = 'social';
        } else if (hostname.includes('mail') || hostname.includes('email')) {
          trafficSource = 'email';
        } else {
          trafficSource = 'referral';
        }
      } catch (e) {
        // Invalid URL, keep as direct
      }
    }

    // Create visit data
    const visitData = {
      sessionId,
      ipAddress,
      userAgent,
      device,
      path: path || '/',
      referrer: referrer || 'direct',
      language: language || 'en',
      isNewVisitor,
      visitCount,
      pageViews: 1,
      trafficSource,
      contactInfo: {
        consentGiven: consent,
        consentTimestamp: new Date(timestamp)
      }
    };

    // Create new visit record
    const visit = new Visit(visitData);
    await visit.save();
    
    // Store visit ID in session
    if (req.session) {
      req.session.visitId = visit._id;
      req.session.save();
    }

    res.json({ 
      success: true, 
      visitId: visit._id,
      sessionId: sessionId,
      message: 'Visitor tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking visitor' 
    });
  }
});

// Update visitor location (requires cookie consent)
router.post('/location', updateVisitorLocation);

// Update visitor contact information
router.post('/contact', updateVisitorContact);

// Get visitors with contact information (admin only)
router.get('/contacts', authenticateToken, requireSuperAdmin, getVisitorsWithContact);

// Get current visitor session info
router.get('/session', (req, res) => {
  try {
    const visitId = req.session?.visitId;
    const cookieConsent = req.cookies?.cookieConsent === 'true';
    
    res.json({
      hasSession: !!visitId,
      visitId: visitId || null,
      cookieConsent,
      sessionId: req.sessionID
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    res.status(500).json({ error: 'Failed to get session info' });
  }
});

// Request location permission endpoint
router.post('/request-location', (req, res) => {
  try {
    const visitId = req.session?.visitId;
    const cookieConsent = req.cookies?.cookieConsent === 'true';
    
    if (!visitId) {
      return res.status(400).json({ 
        error: 'No active session found',
        requiresSession: true 
      });
    }
    
    if (!cookieConsent) {
      return res.status(403).json({ 
        error: 'Location tracking requires cookie consent',
        requiresConsent: true 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Location permission can be requested',
      canRequestLocation: true 
    });
  } catch (error) {
    console.error('Error checking location permission:', error);
    res.status(500).json({ error: 'Failed to check location permission' });
  }
});

module.exports = router;