const ROPart = require('../models/ROPart');
const path = require('path');
const fs = require('fs').promises;

// Get all RO parts (public endpoint with pagination and filters)
const getROParts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      search,
      inStock
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [parts, total] = await Promise.all([
      ROPart.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ROPart.countDocuments(query)
    ]);

    // Get categories and brands for filters
    const categories = await ROPart.distinct('category', { isActive: true });
    const brands = await ROPart.distinct('brand', { isActive: true });

    res.json({
      success: true,
      data: {
        parts,
        categories,
        brands,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get RO parts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RO parts'
    });
  }
};

// Get single RO part by ID (public endpoint)
const getROPart = async (req, res) => {
  try {
    const { id } = req.params;

    const part = await ROPart.findOne({ _id: id, isActive: true });

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'RO part not found'
      });
    }

    // Get related parts (same category, excluding current part)
    const relatedParts = await ROPart.find({
      category: part.category,
      _id: { $ne: part._id },
      isActive: true
    })
    .limit(4)
    .select('name image category price brand');

    res.json({
      success: true,
      data: {
        part,
        relatedParts
      }
    });

  } catch (error) {
    console.error('Get RO part error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RO part'
    });
  }
};

// Create RO part (admin only)
const createROPart = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      partNumber,
      price,
      stockQuantity,
      specifications,
      compatibility,
      featured = false
    } = req.body;

    const part = new ROPart({
      name,
      description,
      category,
      brand,
      partNumber,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      specifications: specifications ? specifications.split(',').map(s => s.trim()) : [],
      compatibility: compatibility ? compatibility.split(',').map(c => c.trim()) : [],
      featured,
      image: req.file ? `/uploads/ro-parts/${req.file.filename}` : null
    });

    await part.save();

    res.status(201).json({
      success: true,
      message: 'RO part created successfully',
      data: part
    });

  } catch (error) {
    console.error('Create RO part error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create RO part'
    });
  }
};

// Update RO part (admin only)
const updateROPart = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      brand,
      partNumber,
      price,
      stockQuantity,
      specifications,
      compatibility,
      featured,
      isActive
    } = req.body;

    const updateData = {
      name,
      description,
      category,
      brand,
      partNumber,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      specifications: specifications ? specifications.split(',').map(s => s.trim()) : [],
      compatibility: compatibility ? compatibility.split(',').map(c => c.trim()) : [],
      featured,
      isActive
    };

    if (req.file) {
      updateData.image = `/uploads/ro-parts/${req.file.filename}`;
    }

    const part = await ROPart.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'RO part not found'
      });
    }

    res.json({
      success: true,
      message: 'RO part updated successfully',
      data: part
    });

  } catch (error) {
    console.error('Update RO part error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update RO part'
    });
  }
};

// Delete RO part (admin only)
const deleteROPart = async (req, res) => {
  try {
    const { id } = req.params;

    const part = await ROPart.findByIdAndDelete(id);
    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'RO part not found'
      });
    }

    // Delete associated image file if exists
    if (part.image) {
      try {
        const imagePath = path.join(__dirname, '..', 'uploads', part.image.replace('/uploads/', ''));
        await fs.unlink(imagePath);
      } catch (fileError) {
        console.log('Image file not found or already deleted');
      }
    }

    res.json({
      success: true,
      message: 'RO part deleted successfully'
    });

  } catch (error) {
    console.error('Delete RO part error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete RO part'
    });
  }
};

// Toggle RO part status (admin only)
const toggleROPartStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const part = await ROPart.findById(id);
    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'RO part not found'
      });
    }

    part.isActive = !part.isActive;
    await part.save();

    res.json({
      success: true,
      message: `RO part ${part.isActive ? 'activated' : 'deactivated'} successfully`,
      data: part
    });

  } catch (error) {
    console.error('Toggle RO part status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle RO part status'
    });
  }
};

// Get RO parts for admin (admin only)
const getROPartsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      search,
      isActive,
      inStock
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [parts, total] = await Promise.all([
      ROPart.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ROPart.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        parts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get RO parts admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RO parts'
    });
  }
};

// Get RO parts stats (admin only)
const getROPartsStats = async (req, res) => {
  try {
    const stats = await ROPart.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          inStock: { $sum: { $cond: [{ $eq: ['$inStock', true] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$inStock', false] }, 1, 0] } },
          featured: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
          totalStock: { $sum: '$stockQuantity' }
        }
      }
    ]);

    const categoryStats = await ROPart.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const brandStats = await ROPart.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { 
          total: 0, 
          active: 0, 
          inactive: 0, 
          inStock: 0, 
          outOfStock: 0, 
          featured: 0,
          totalStock: 0 
        },
        byCategory: categoryStats,
        byBrand: brandStats
      }
    });

  } catch (error) {
    console.error('Get RO parts stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RO parts statistics'
    });
  }
};

module.exports = {
  getROParts,
  getROPart,
  createROPart,
  updateROPart,
  deleteROPart,
  toggleROPartStatus,
  getROPartsAdmin,
  getROPartsStats
};