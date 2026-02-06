const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateIssueRequest } = require('../middleware/validation');
const { logVisitor } = require('../middleware/visitorLogger');

// Public routes
router.post('/', issueController.submitIssueRequest);

// Admin routes (require authentication)
router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/', issueController.getIssueRequests);
router.get('/stats', issueController.getIssueStats);
router.get('/:id', issueController.getIssueRequest);
router.put('/:id', issueController.updateIssueStatus);
router.delete('/:id', issueController.deleteIssueRequest);
router.post('/:id/assign', issueController.assignIssueRequest);
router.patch('/:id/read', issueController.markAsRead);

module.exports = router;