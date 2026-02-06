const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const { authenticateToken, requireSuperAdmin, requireRole } = require('../middleware/auth');
const { validateService } = require('../middleware/validation');
const { uploadConfigs } = require('../middleware/upload');
const { logVisitor } = require('../middleware/visitorLogger');

// Public routes
router.get('/', servicesController.getServices);
router.get('/:id', servicesController.getService);

// Admin routes (require authentication)
router.use(authenticateToken);
// Allow both admin and super_admin roles to access service management
router.use(requireRole(['admin', 'super_admin']));

router.get('/admin/list', servicesController.getServicesAdmin);
router.get('/admin/stats', servicesController.getServicesStats);
router.post('/', uploadConfigs.service, servicesController.createService);
router.put('/:id', uploadConfigs.service, servicesController.updateService);
router.delete('/:id', servicesController.deleteService);
router.patch('/:id/toggle-status', servicesController.toggleServiceStatus);

module.exports = router;