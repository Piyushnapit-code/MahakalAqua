const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateGalleryItem } = require('../middleware/validation');
const { uploadConfigs } = require('../middleware/upload');
const { logVisitor } = require('../middleware/visitorLogger');

// Public routes
router.get('/', galleryController.getGalleryItems);
router.get('/:id', galleryController.getGalleryItem);

// Admin routes (require authentication)
router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/admin/list', galleryController.getGalleryItemsAdmin);
router.get('/admin/stats', galleryController.getGalleryStats);
router.post('/', uploadConfigs.gallery, galleryController.createGalleryItem);
router.put('/:id', uploadConfigs.gallery, galleryController.updateGalleryItem);
router.delete('/:id', galleryController.deleteGalleryItem);
router.patch('/:id/toggle-status', galleryController.toggleGalleryItemStatus);

module.exports = router;