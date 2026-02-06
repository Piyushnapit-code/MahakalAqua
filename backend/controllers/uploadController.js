const path = require('path');
const fs = require('fs').promises;
const GalleryItem = require('../models/GalleryItem');
const Service = require('../models/Service');
const ROPart = require('../models/ROPart');

// Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get category from query params (sent by multer destination callback) or body
    const category = req.query?.category || req.body?.category || 'temp';

    
    // Determine upload directory based on category
    let uploadDir = 'uploads/temp';
    if (category === 'gallery') {
      uploadDir = 'uploads/gallery';
    } else if (category === 'services') {
      uploadDir = 'uploads/services';
    } else if (category === 'parts' || category === 'ro-parts') {
      uploadDir = 'uploads/ro-parts';
    } else if (category === 'issues') {
      uploadDir = 'uploads/issues';
    }

    // Get the file path
    const filePath = path.join(uploadDir, req.file.filename);
    const fileUrl = `/${filePath.replace(/\\/g, '/')}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// Upload multiple images
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Get category from query params (sent by multer destination callback) or body
    const category = req.query?.category || req.body?.category || 'temp';

    
    // Determine upload directory based on category
    let uploadDir = 'uploads/temp';
    if (category === 'gallery') {
      uploadDir = 'uploads/gallery';
    } else if (category === 'services') {
      uploadDir = 'uploads/services';
    } else if (category === 'parts' || category === 'ro-parts') {
      uploadDir = 'uploads/ro-parts';
    } else if (category === 'issues') {
      uploadDir = 'uploads/issues';
    }

    // Process all uploaded files
    const uploadedFiles = req.files.map(file => {
      const filePath = path.join(uploadDir, file.filename);
      const fileUrl = `/${filePath.replace(/\\/g, '/')}`;
      
      return {
        success: true,
        data: {
          url: fileUrl,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }
      };
    });

    res.json(uploadedFiles);
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Extract file path from URL
    let filePath = url;
    if (url.startsWith('/')) {
      filePath = path.join(__dirname, '..', url);
    } else if (url.startsWith('http')) {
      // Extract path from full URL
      const urlPath = new URL(url).pathname;
      filePath = path.join(__dirname, '..', urlPath);
    } else {
      filePath = path.join(__dirname, '..', 'uploads', url);
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      // File doesn't exist, but return success anyway
      return res.json({
        success: true,
        message: 'Image deleted (file not found)'
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    // Also check if this image is referenced in any models and remove references
    try {
      // Check gallery items
      await GalleryItem.updateMany(
        { 'image.url': url },
        { $unset: { image: 1 } }
      );

      // Check services
      await Service.updateMany(
        { 'image.url': url },
        { $unset: { image: 1 } }
      );

      // Check RO parts
      await ROPart.updateMany(
        { 'image.url': url },
        { $unset: { image: 1 } }
      );
    } catch (dbError) {
      console.error('Error removing image references:', dbError);
      // Continue even if database update fails
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultiple,
  deleteImage
};

