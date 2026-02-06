const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateContactForm } = require('../middleware/validation');
const { logVisitor } = require('../middleware/visitorLogger');

// Public routes
router.post('/', contactController.submitContactForm);

// Admin routes (require authentication)
router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/', contactController.getContactRequests);
router.get('/stats', contactController.getContactStats);
router.get('/:id', contactController.getContactRequest);
router.put('/:id', contactController.updateContactStatus);
router.delete('/:id', contactController.deleteContactRequest);
router.post('/:id/assign', contactController.assignContactRequest);
router.patch('/:id/read', contactController.markAsRead);

module.exports = router;