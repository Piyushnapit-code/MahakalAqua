const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateAdminLogin, validatePasswordChange } = require('../middleware/validation');

// Public routes
router.post('/login', validateAdminLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-token/:token', authController.verifyToken);
router.post('/logout', authController.logout); // Logout should work without auth

// Protected routes (require authentication)
router.use(authenticateToken);

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', validatePasswordChange, authController.changePassword);

// Admin only routes
router.get('/login-attempts', requireSuperAdmin, authController.getLoginAttempts);

module.exports = router;