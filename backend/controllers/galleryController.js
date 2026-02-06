const GalleryItem = require('../models/GalleryItem');
const path = require('path');
const fs = require('fs').promises;

// Get all gallery items (public endpoint with pagination and filters)
const getGalleryItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      GalleryItem.find(query)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      GalleryItem.countDocuments(query)
    ]);

    // Get categories for filters
    const categories = await GalleryItem.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: {
        items,
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items'
    });
  }
};

// Get single gallery item by ID (public endpoint)
const getGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await GalleryItem.findOne({ _id: id, isActive: true });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Get related items (same category, excluding current item)
    const relatedItems = await GalleryItem.find({
      category: item.category,
      _id: { $ne: item._id },
      isActive: true
    })
    .limit(6)
    .select('title image category');

    res.json({
      success: true,
      data: {
        item,
        relatedItems
      }
    });

  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery item'
    });
  }
};

// Get gallery by category (public endpoint)
const getGalleryByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const {
      page = 1,
      limit = 12
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      GalleryItem.find({ category, isActive: true })
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      GalleryItem.countDocuments({ category, isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        items,
        category,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get gallery by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items'
    });
  }
};

// Create gallery item (admin only)
const createGalleryItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      projectType,
      location,
      featured = false,
      displayOrder = 0,
      rating = 5,
      client,
      projectDate,
      imageUrl,
      tags = []
    } = req.body;

    const imageData = imageUrl ? {
      url: imageUrl,
      filename: imageUrl.split('/').pop(),
      alt: title
    } : (req.file ? {
      url: `/uploads/gallery/${req.file.filename}`,
      filename: req.file.filename,
      alt: title
    } : null);

    const galleryItem = new GalleryItem({
      title,
      description,
      category,
      projectType,
      location,
      featured,
      displayOrder,
      rating,
      client,
      projectDate: projectDate ? new Date(projectDate) : undefined,
      image: imageData,
      tags
    });

    await galleryItem.save();

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: galleryItem
    });

  } catch (error) {
    console.error('Create gallery item error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update gallery item (admin only)
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      projectType,
      location,
      featured,
      displayOrder,
      isActive,
      rating,
      client,
      projectDate,
      imageUrl,
      tags
    } = req.body;

    const updateData = {
      title,
      description,
      category,
      projectType,
      location,
      featured,
      displayOrder,
      isActive,
      rating,
      client,
      projectDate: projectDate ? new Date(projectDate) : undefined,
      tags
    };

    if (imageUrl) {
      updateData.image = {
        url: imageUrl,
        filename: imageUrl.split('/').pop(),
        alt: title
      };
    } else if (req.file) {
      updateData.image = {
        url: `/uploads/gallery/${req.file.filename}`,
        filename: req.file.filename,
        alt: title
      };
    }

    const galleryItem = await GalleryItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem
    });

  } catch (error) {
    console.error('Update gallery item error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete gallery item (admin only)
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem = await GalleryItem.findByIdAndDelete(id);
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete associated image file if exists
    if (galleryItem.image) {
      try {
        const imagePath = path.join(__dirname, '..', 'uploads', galleryItem.image.replace('/uploads/', ''));
        await fs.unlink(imagePath);
      } catch (fileError) {
        console.log('Image file not found or already deleted');
      }
    }

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });

  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery item'
    });
  }
};

// Toggle gallery item status (admin only)
const toggleGalleryItemStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem = await GalleryItem.findById(id);
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    galleryItem.isActive = !galleryItem.isActive;
    await galleryItem.save();

    res.json({
      success: true,
      message: `Gallery item ${galleryItem.isActive ? 'activated' : 'deactivated'} successfully`,
      data: galleryItem
    });

  } catch (error) {
    console.error('Toggle gallery item status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle gallery item status'
    });
  }
};

// Get gallery items for admin (admin only)
const getGalleryItemsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      isActive
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      GalleryItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      GalleryItem.countDocuments(query)
    ]);

    // Transform items to include imageUrl for frontend compatibility
    const transformedItems = items.map(item => {
      const itemObj = item.toObject();
      // Map image.url to imageUrl for frontend compatibility
      if (itemObj.image && itemObj.image.url) {
        itemObj.imageUrl = itemObj.image.url;
        itemObj.thumbnailUrl = itemObj.image.url; // Use same URL for thumbnail
      } else {
        itemObj.imageUrl = '';
        itemObj.thumbnailUrl = '';
      }
      // Ensure id field exists
      itemObj.id = itemObj._id.toString();
      return itemObj;
    });

    res.json({
      success: true,
      items: transformedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get gallery items admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items'
    });
  }
};

// Get gallery stats (admin only)
const getGalleryStats = async (req, res) => {
  try {
    const stats = await GalleryItem.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          featured: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await GalleryItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, active: 0, inactive: 0, featured: 0 },
        byCategory: categoryStats
      }
    });

  } catch (error) {
    console.error('Get gallery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery statistics'
    });
  }
};

module.exports = {
  getGalleryItems,
  getGalleryItem,
  getGalleryByCategory,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemStatus,
  getGalleryItemsAdmin,
  getGalleryStats
};