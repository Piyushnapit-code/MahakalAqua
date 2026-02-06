const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  console.log('🔐 authenticateToken middleware called for:', req.method, req.url);
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find admin user
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - admin not found'
      });
    }

    // Check if admin account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is locked due to multiple failed login attempts'
      });
    }

    // Add admin info to request object
    req.admin = admin;
    req.adminId = admin._id;
    
    next();
  } catch (error) {
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

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check admin role permissions
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if admin is super admin
const requireSuperAdmin = (req, res, next) => {
  console.log('👑 requireSuperAdmin middleware called, admin role:', req.admin?.role);
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

// Middleware to check if admin can manage other admins
const requireAdminManagement = (req, res, next) => {
  if (!req.admin || !['super_admin', 'admin'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin management permissions required'
    });
  }
  next();
};

// Middleware for optional authentication (for public routes that can benefit from auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.adminId).select('-password');
      
      if (admin && admin.isActive && !admin.isLocked) {
        req.admin = admin;
        req.adminId = admin._id;
      }
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign(
    { adminId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'mahakal-aqua',
      audience: 'mahakal-aqua-admin'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'mahakal-aqua',
      audience: 'mahakal-aqua-admin'
    }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

// Middleware to log admin actions
const logAdminAction = (action) => {
  return (req, res, next) => {
    // Store action info for logging after response
    req.adminAction = {
      action,
      adminId: req.adminId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };
    
    // Log after response is sent
    const originalSend = res.send;
    res.send = function(data) {
      // Log the action (you can implement a logging service here)
      console.log('Admin Action:', {
        ...req.adminAction,
        success: res.statusCode < 400,
        statusCode: res.statusCode,
        method: req.method,
        path: req.path,
        body: req.method !== 'GET' ? req.body : undefined
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Rate limiting for auth endpoints
const authRateLimitWindowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10);
const authRateLimitMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10);
const authRateLimit = require('express-rate-limit')({
  windowMs: authRateLimitWindowMs,
  max: authRateLimitMax,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for successful requests
    return req.admin && req.admin.isActive;
  }
});

// Password reset rate limiting
const passwordResetRateLimitWindowMs = parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS || '3600000', 10);
const passwordResetRateLimitMax = parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX || '3', 10);
const passwordResetRateLimit = require('express-rate-limit')({
  windowMs: passwordResetRateLimitWindowMs,
  max: passwordResetRateLimitMax,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireAdminManagement,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  logAdminAction,
  authRateLimit,
  passwordResetRateLimit
};