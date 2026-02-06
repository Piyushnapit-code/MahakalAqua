const Admin = require('../models/Admin');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const crypto = require('crypto');

// Admin login
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await admin.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
    }

    // Update last login
    admin.lastLogin = new Date();
    admin.lastLoginIP = req.ip;
    await admin.save();

    // Generate tokens
    const accessToken = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    // Set refresh token as httpOnly cookie - REQUIRES COOKIE_* and JWT_EXPIRES_IN in env
    const cookieSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
    const cookieSameSite = process.env.COOKIE_SAME_SITE;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
    
    if (!cookieSameSite || !jwtExpiresIn) {
      return res.status(500).json({ success: false, message: 'Cookie and JWT configuration incomplete' });
    }
    
    const cookieOptions = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          _id: admin._id.toString(),
          id: admin._id.toString(),
          username: admin.email, // Use email as username for compatibility
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : undefined,
          createdAt: admin.createdAt ? admin.createdAt.toISOString() : undefined,
          updatedAt: admin.updatedAt ? admin.updatedAt.toISOString() : undefined
        },
        accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin logout
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie - REQUIRES COOKIE_* variables in env
    const cookieSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
    const cookieSameSite = process.env.COOKIE_SAME_SITE;
    
    if (!cookieSameSite) {
      return res.status(500).json({ success: false, message: 'Cookie configuration incomplete' });
    }
    
    const cookieOptions = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/'
    };

    // Clear cookie with different domain options
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('refreshToken', { ...cookieOptions, domain: undefined });
    
    // Also clear any other auth-related cookies
    res.clearCookie('authToken', cookieOptions);
    res.clearCookie('token', cookieOptions);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, return success to allow client-side cleanup
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find admin
    const admin = await Admin.findById(decoded.adminId).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateToken(admin._id);

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Get current admin profile
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          _id: admin._id.toString(),
          id: admin._id.toString(),
          username: admin.email, // Use email as username for compatibility
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : undefined,
          createdAt: admin.createdAt ? admin.createdAt.toISOString() : undefined,
          updatedAt: admin.updatedAt ? admin.updatedAt.toISOString() : undefined
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update admin profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminId = req.adminId;

    // Check if email is already taken by another admin
    if (email) {
      const existingAdmin = await Admin.findOne({ 
        email, 
        _id: { $ne: adminId } 
      });
      
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    // Update admin
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { 
        ...(name && { name }),
        ...(email && { email })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { admin }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.adminId;

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set reset token and expiry
    // Password reset expiry - REQUIRES PASSWORD_RESET_EXPIRES_MS in env
    const passwordResetExpiresMs = parseInt(process.env.PASSWORD_RESET_EXPIRES_MS, 10);
    if (!passwordResetExpiresMs) {
      return res.status(500).json({ success: false, message: 'Password reset configuration incomplete' });
    }
    admin.passwordResetToken = resetTokenHash;
    admin.passwordResetExpires = Date.now() + passwordResetExpiresMs;
    await admin.save();

    // In a real application, you would send an email here
    // For now, we'll just log the reset token (remove in production)
    console.log('Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find admin with valid reset token
    const admin = await Admin.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    admin.password = newPassword;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify token (for frontend to check if token is valid)
const verifyToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware already verified it)
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        admin: {
          _id: req.admin._id.toString(),
          id: req.admin._id.toString(),
          username: req.admin.email, // Use email as username for compatibility
          name: req.admin.name,
          email: req.admin.email,
          role: req.admin.role,
          isActive: req.admin.isActive,
          lastLogin: req.admin.lastLogin ? req.admin.lastLogin.toISOString() : undefined,
          createdAt: req.admin.createdAt ? req.admin.createdAt.toISOString() : undefined,
          updatedAt: req.admin.updatedAt ? req.admin.updatedAt.toISOString() : undefined
        }
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get login attempts (for security monitoring)
const getLoginAttempts = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('loginAttempts lockUntil lastLogin lastLoginIP');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: {
        loginAttempts: admin.loginAttempts,
        isLocked: admin.isLocked,
        lockUntil: admin.lockUntil,
        lastLogin: admin.lastLogin,
        lastLoginIP: admin.lastLoginIP
      }
    });

  } catch (error) {
    console.error('Get login attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
  getLoginAttempts
};