const express = require('express');
const router = express.Router();
const roPartsController = require('../controllers/roPartsController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateROPart } = require('../middleware/validation');
const { uploadConfigs } = require('../middleware/upload');
const { logVisitor } = require('../middleware/visitorLogger');

// Public routes
router.get('/', roPartsController.getROParts);
router.get('/:id', roPartsController.getROPart);

// Admin routes (require authentication)
router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/admin/list', roPartsController.getROPartsAdmin);
router.get('/admin/stats', roPartsController.getROPartsStats);
router.post('/', uploadConfigs.part, roPartsController.createROPart);
router.put('/:id', uploadConfigs.part, roPartsController.updateROPart);
router.delete('/:id', roPartsController.deleteROPart);
router.patch('/:id/toggle-status', roPartsController.toggleROPartStatus);

module.exports = router;