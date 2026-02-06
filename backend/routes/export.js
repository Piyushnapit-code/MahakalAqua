const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// All export routes require authentication and super admin access
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Individual export routes
router.get('/contacts', exportController.exportContacts);
router.get('/enquiries', exportController.exportEnquiries);
router.get('/issues', exportController.exportIssues);
router.get('/services', exportController.exportServices);
router.get('/ro-parts', exportController.exportROParts);
router.get('/gallery', exportController.exportGallery);
router.get('/visitors', exportController.exportVisitors);

// Export all data in one file
router.get('/all', exportController.exportAll);

module.exports = router;

