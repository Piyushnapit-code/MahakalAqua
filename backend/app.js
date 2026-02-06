const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const enquiryRoutes = require('./routes/enquiry');
const issueRoutes = require('./routes/issues');
const roPartsRoutes = require('./routes/roParts');
const servicesRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const analyticsRoutes = require('./routes/analytics');
const visitorRoutes = require('./routes/visitor');
const exportRoutes = require('./routes/export');
const uploadRoutes = require('./routes/upload');

// Import middleware
// const { logVisitor } = require('./middleware/visitorLogger');
const { validateCookieConsent } = require('./middleware/validation');

const app = express();

// Removed verbose per-request console logging (morgan handles request logs)

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS configuration - REQUIRES CORS_ORIGINS in env
const corsOptions = {
  origin: function (origin, callback) {
    const corsOriginsEnv = process.env.CORS_ORIGINS;
    if (!corsOriginsEnv) {
      console.error('ERROR: CORS_ORIGINS environment variable is not set');
      return callback(new Error('CORS_ORIGINS environment variable is required'));
    }
    const allowedOrigins = corsOriginsEnv.split(',').map(origin => origin.trim());
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Disposition']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware - REQUIRES BODY_PARSER_LIMIT in env
const bodyParserLimit = process.env.BODY_PARSER_LIMIT;
if (!bodyParserLimit) throw new Error('BODY_PARSER_LIMIT environment variable is required');
app.use(express.json({ limit: bodyParserLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyParserLimit }));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  
  // Log to file in production
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Log to console in development
  app.use(morgan('dev'));
}

// Removed debug middleware that logged all requests

// Rate limiting - REQUIRES RATE_LIMIT_* variables in env
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX, 10);
const rateLimitStrictMax = parseInt(process.env.RATE_LIMIT_STRICT_MAX, 10);
if (!rateLimitWindowMs || !rateLimitMax || !rateLimitStrictMax) {
  throw new Error('RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, and RATE_LIMIT_STRICT_MAX environment variables are required');
}

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitStrictMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// app.use('/api/', limiter); // Temporarily disabled for debugging
app.use('/api/auth/login', strictLimiter);
app.use('/api/contact', strictLimiter);
app.use('/api/enquiry', strictLimiter);
app.use('/api/issues', strictLimiter);

// Static cache configuration - REQUIRES CACHE_MAX_AGE variables in env
const staticCacheMaxAge = process.env.STATIC_CACHE_MAX_AGE;
const imageCacheMaxAge = process.env.IMAGE_CACHE_MAX_AGE;
if (!staticCacheMaxAge || !imageCacheMaxAge) {
  throw new Error('STATIC_CACHE_MAX_AGE and IMAGE_CACHE_MAX_AGE environment variables are required');
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: staticCacheMaxAge,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.setHeader('Cache-Control', `public, max-age=${imageCacheMaxAge}, immutable`);
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 HEALTH ENDPOINT HIT - This should appear in logs!');
  res.json({
    success: true,
    message: 'Server is running - UPDATED VERSION',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    serverId: 'backend-server-v2'
  });
});

// Removed leftover simple test route

// Cookie consent endpoint - REQUIRES COOKIE_* variables in env
app.post('/api/cookie-consent', validateCookieConsent, (req, res) => {
  const { consent, preferences } = req.body;
  
  const cookieMaxAge = parseInt(process.env.COOKIE_MAX_AGE, 10);
  const cookieSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const cookieSameSite = process.env.COOKIE_SAME_SITE;
  
  if (!cookieMaxAge || !cookieSameSite) {
    return res.status(500).json({ success: false, message: 'Cookie configuration incomplete' });
  }
  
  res.cookie('cookieConsent', JSON.stringify({
    consent,
    preferences,
    timestamp: new Date().toISOString()
  }), {
    maxAge: cookieMaxAge,
    httpOnly: false,
    secure: cookieSecure,
    sameSite: cookieSameSite
  });
  
  res.json({
    success: true,
    message: 'Cookie consent updated'
  });
});
  
// Removed temporary simple test route

// API routes
console.log('🔍 Visitor route module loaded');

// Removed temporary direct visitor test route

app.use('/api/visitor', visitorRoutes);
console.log('🔍 Visitor routes mounted at /api/visitor');
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/ro-parts', roPartsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/gallery', galleryRoutes);

// Removed temporary analytics and test routes

app.use('/api/analytics', analyticsRoutes);
console.log('📊 Analytics routes mounted at /api/analytics');
app.use('/api/export', exportRoutes);
console.log('📥 Export routes mounted at /api/export');
app.use('/api/upload', uploadRoutes);
console.log('📤 Upload routes mounted at /api/upload');

// Visitor logging for all routes (except API routes)
// app.use(logVisitor);

  // Serve React app in production - REQUIRES FRONTEND_BUILD_PATH in env
  if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = process.env.FRONTEND_BUILD_PATH;
    if (!frontendBuildPath) {
      console.error('ERROR: FRONTEND_BUILD_PATH environment variable is required for production');
      throw new Error('FRONTEND_BUILD_PATH environment variable is required');
    }
  app.use(express.static(path.join(__dirname, frontendBuildPath), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(css|js)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filePath.match(/\.(woff2?|ttf|otf|eot)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    }
  }));
  
  app.get('*', (req, res) => {
    const frontendBuildPath = process.env.FRONTEND_BUILD_PATH;
    if (!frontendBuildPath) {
      return res.status(500).json({ success: false, message: 'Frontend build path not configured' });
    }
    res.sendFile(path.join(__dirname, frontendBuildPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field'
    });
  }
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Import database connection
const connectDatabase = require('./config/database');

// Connect to database
connectDatabase();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;