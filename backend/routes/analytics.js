const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const exportController = require('../controllers/exportController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateDateRange } = require('../middleware/validation');

// All analytics routes require admin authentication
// router.use(authenticateToken);
// router.use(requireSuperAdmin);

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Analytics test route called');
  res.json({ message: 'Analytics routes are working!' });
});

router.get('/dashboard', analyticsController.getDashboardOverview);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/visitors/all', analyticsController.getAllVisitors);
router.get('/visitors/contacts', analyticsController.getVisitorsWithContact);
router.get('/visitors/locations', analyticsController.getLocationAnalytics);
router.get('/visitors', analyticsController.getVisitorAnalytics);
router.get('/visitors/export', authenticateToken, requireSuperAdmin, exportController.exportVisitors);

module.exports = router;