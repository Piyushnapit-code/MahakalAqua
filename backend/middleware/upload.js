const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/gallery',
    'uploads/services',
    'uploads/ro-parts',
    'uploads/issues',
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/temp'; // default path

    // First check for category in request body (for /api/upload routes)
    const category = req.body?.category || req.query?.category;
    if (category) {
      if (category === 'gallery') {
        uploadPath = 'uploads/gallery';
      } else if (category === 'services') {
        uploadPath = 'uploads/services';
      } else if (category === 'parts' || category === 'ro-parts') {
        uploadPath = 'uploads/ro-parts';
      } else if (category === 'issues') {
        uploadPath = 'uploads/issues';
      }
    }
    // Determine upload path based on route or field name
    else if (req.path.includes('/gallery')) {
      uploadPath = 'uploads/gallery';
    } else if (req.path.includes('/services')) {
      uploadPath = 'uploads/services';
    } else if (req.path.includes('/parts') || req.path.includes('/ro-parts')) {
      uploadPath = 'uploads/ro-parts';
    } else if (req.path.includes('/issues')) {
      uploadPath = 'uploads/issues';
    } else if (file.fieldname === 'gallery') {
      uploadPath = 'uploads/gallery';
    } else if (file.fieldname === 'service') {
      uploadPath = 'uploads/services';
    } else if (file.fieldname === 'part') {
      uploadPath = 'uploads/ro-parts';
    } else if (file.fieldname === 'issue') {
      uploadPath = 'uploads/issues';
    }

    // Convert to absolute path
    const absolutePath = path.join(process.cwd(), uploadPath);
    
    // Ensure directory exists
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }

    cb(null, absolutePath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    const filename = `${Date.now()}_${uniqueSuffix}_${name}${ext}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'image/svg+xml': ['.svg'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  // Check if file type is allowed
  if (allowedTypes[file.mimetype]) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes[file.mimetype].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file extension. Expected: ${allowedTypes[file.mimetype].join(', ')}`), false);
    }
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
  }
};

// File upload configuration - REQUIRES MAX_FILE_SIZE and MAX_FILES_PER_REQUEST in env
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10);
const maxFilesPerRequest = parseInt(process.env.MAX_FILES_PER_REQUEST, 10);
if (!maxFileSize || !maxFilesPerRequest) {
  throw new Error('MAX_FILE_SIZE and MAX_FILES_PER_REQUEST environment variables are required');
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: maxFilesPerRequest
  }
});

// Specific upload configurations
const uploadConfigs = {
  // Single image upload
  single: (fieldName = 'image') => upload.single(fieldName),
  
  // Multiple images upload
  multiple: (fieldName = 'images', maxCount = 5) => upload.array(fieldName, maxCount),
  
  // Gallery upload (multiple images)
  gallery: upload.array('images', 10),
  
  // Service image upload
  service: upload.single('image'),
  
  // RO Part image upload
  part: upload.single('image'),
  
  // Issue attachments upload
  issue: upload.array('attachments', 5),
  
  // Mixed upload (different field names)
  mixed: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'attachments', maxCount: 5 }
  ])
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${maxSizeMB}MB.`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum allowed is 10 files.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name in file upload.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  }

  if (error.message.includes('Invalid file')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Middleware to process uploaded files
const processUploadedFiles = (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Process single file
    if (req.file) {
      req.file.url = `${baseUrl}/${req.file.path.replace(/\\/g, '/')}`;
      req.uploadedFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: req.file.url
      };
    }

    // Process multiple files
    if (req.files) {
      if (Array.isArray(req.files)) {
        // Array of files (from upload.array())
        req.uploadedFiles = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `${baseUrl}/${file.path.replace(/\\/g, '/')}`
        }));
      } else {
        // Object with field names (from upload.fields())
        req.uploadedFiles = {};
        Object.keys(req.files).forEach(fieldName => {
          req.uploadedFiles[fieldName] = req.files[fieldName].map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: `${baseUrl}/${file.path.replace(/\\/g, '/')}`
          }));
        });
      }
    }

    next();
  } catch (error) {
    console.error('File processing error:', error);
    next(error);
  }
};

// Middleware to validate image dimensions
const validateImageDimensions = (minWidth = 100, minHeight = 100, maxWidth = 4000, maxHeight = 4000) => {
  return async (req, res, next) => {
    try {
      const sharp = require('sharp');
      const files = req.files || (req.file ? [req.file] : []);

      for (const file of files) {
        if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
          const metadata = await sharp(file.path).metadata();
          
          if (metadata.width < minWidth || metadata.height < minHeight) {
            // Delete the uploaded file
            fs.unlinkSync(file.path);
            return res.status(400).json({
              success: false,
              message: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`
            });
          }

          if (metadata.width > maxWidth || metadata.height > maxHeight) {
            // Delete the uploaded file
            fs.unlinkSync(file.path);
            return res.status(400).json({
              success: false,
              message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Image validation error:', error);
      next();
    }
  };
};

// Middleware to generate image thumbnails
const generateThumbnails = (sizes = [{ width: 300, height: 300, suffix: '_thumb' }]) => {
  return async (req, res, next) => {
    try {
      const sharp = require('sharp');
      const files = req.files || (req.file ? [req.file] : []);

      for (const file of files) {
        if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
          for (const size of sizes) {
            const ext = path.extname(file.filename);
            const name = path.basename(file.filename, ext);
            const thumbFilename = `${name}${size.suffix}${ext}`;
            const thumbPath = path.join(path.dirname(file.path), thumbFilename);

            await sharp(file.path)
              .resize(size.width, size.height, {
                fit: 'cover',
                position: 'center'
              })
              .jpeg({ quality: 80 })
              .toFile(thumbPath);

            // Add thumbnail info to file object
            if (!file.thumbnails) file.thumbnails = [];
            file.thumbnails.push({
              filename: thumbFilename,
              path: thumbPath,
              url: `${req.protocol}://${req.get('host')}/${thumbPath.replace(/\\/g, '/')}`,
              width: size.width,
              height: size.height
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      next();
    }
  };
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to delete multiple files
const deleteFiles = (filePaths) => {
  const results = [];
  filePaths.forEach(filePath => {
    results.push(deleteFile(filePath));
  });
  return results;
};

// Cleanup middleware to delete files on error
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response is an error and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      const files = req.files || (req.file ? [req.file] : []);
      files.forEach(file => {
        deleteFile(file.path);
        // Delete thumbnails if they exist
        if (file.thumbnails) {
          file.thumbnails.forEach(thumb => deleteFile(thumb.path));
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  upload,
  uploadConfigs,
  handleUploadError,
  processUploadedFiles,
  validateImageDimensions,
  generateThumbnails,
  deleteFile,
  deleteFiles,
  cleanupOnError,
  createUploadDirs
};