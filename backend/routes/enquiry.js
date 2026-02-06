const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateEnquiryForm } = require('../middleware/validation');
const { logVisitor } = require('../middleware/visitorLogger');

// Public routes
router.post('/', enquiryController.submitEnquiry);

// Admin routes (require authentication)
router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/', enquiryController.getEnquiries);
router.get('/stats', enquiryController.getEnquiryStats);
router.get('/:id', enquiryController.getEnquiry);
router.put('/:id', enquiryController.updateEnquiryStatus);
router.delete('/:id', enquiryController.deleteEnquiry);
router.post('/:id/assign', enquiryController.assignEnquiry);
router.patch('/:id/read', enquiryController.markAsRead);

module.exports = router;