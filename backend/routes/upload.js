const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

// All upload routes require authentication
router.use(authenticateToken);

// Upload single image
router.post('/image', uploadConfigs.single('image'), uploadController.uploadImage);

// Upload multiple images
router.post('/multiple', uploadConfigs.multiple('images', 20), uploadController.uploadMultiple);

// Delete image
router.delete('/image', uploadController.deleteImage);

module.exports = router;

