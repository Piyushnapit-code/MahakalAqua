const Service = require('../models/Service');
const path = require('path');
const fs = require('fs').promises;

// Get all services (public endpoint with pagination and filters)
const getServices = async (req, res) => {
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
    
    const [services, total] = await Promise.all([
      Service.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(query)
    ]);

    // Get categories for filters
    const categories = await Service.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: {
        services,
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
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Get single service by ID (public endpoint)
const getService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({ _id: id, isActive: true });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Get related services (same category, excluding current service)
    const relatedServices = await Service.find({
      category: service.category,
      _id: { $ne: service._id },
      isActive: true
    })
    .limit(4)
    .select('title image category price');

    res.json({
      success: true,
      data: {
        service,
        relatedServices
      }
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
};

// Create service (admin only)
const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      duration,
      features,
      serviceAreas,
      featured = false
    } = req.body;

    const normalizedCategory = (category || 'other').toString().trim().toLowerCase();
    const parsedFeatures = Array.isArray(features)
      ? features.map(f => f.trim()).filter(Boolean)
      : (features ? features.toString().split(',').map(f => f.trim()).filter(Boolean) : []);
    const parsedServiceAreas = Array.isArray(serviceAreas)
      ? serviceAreas.map(s => s.trim()).filter(Boolean)
      : (serviceAreas ? serviceAreas.toString().split(',').map(s => s.trim()).filter(Boolean) : []);

    const imageUrlFromBody = req.body.imageUrl || req.body.image;
    const service = new Service({
      title,
      description,
      category: normalizedCategory,
      price: price !== undefined ? parseFloat(price) : undefined,
      duration: duration !== undefined ? parseInt(duration, 10) : undefined,
      features: parsedFeatures,
      serviceAreas: parsedServiceAreas,
      featured,
      ...(req.file
        ? { image: { filename: req.file.filename, url: `/uploads/services/${req.file.filename}` } }
        : (imageUrlFromBody ? { image: { url: imageUrlFromBody } } : {}))
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });

  } catch (error) {
    console.error('Create service error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
};

// Update service (admin only)
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      price,
      duration,
      features,
      serviceAreas,
      featured,
      isActive
    } = req.body;

    const normalizedCategory = category ? category.toString().trim().toLowerCase() : undefined;
    const parsedFeatures = Array.isArray(features)
      ? features.map(f => f.trim()).filter(Boolean)
      : (features ? features.toString().split(',').map(f => f.trim()).filter(Boolean) : undefined);
    const parsedServiceAreas = Array.isArray(serviceAreas)
      ? serviceAreas.map(s => s.trim()).filter(Boolean)
      : (serviceAreas ? serviceAreas.toString().split(',').map(s => s.trim()).filter(Boolean) : undefined);

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(normalizedCategory !== undefined && { category: normalizedCategory }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(duration !== undefined && { duration: parseInt(duration, 10) }),
      ...(parsedFeatures !== undefined && { features: parsedFeatures }),
      ...(parsedServiceAreas !== undefined && { serviceAreas: parsedServiceAreas }),
      ...(featured !== undefined && { featured }),
      ...(isActive !== undefined && { isActive })
    };

    const imageUrlFromBody = req.body.imageUrl || req.body.image;
    if (req.file) {
      updateData.image = { filename: req.file.filename, url: `/uploads/services/${req.file.filename}` };
    } else if (imageUrlFromBody) {
      updateData.image = { url: imageUrlFromBody };
    }

    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });

  } catch (error) {
    console.error('Update service error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
};

// Delete service (admin only)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Delete associated image file if exists
    if (service.image) {
      try {
        const imagePath = path.join(__dirname, '..', 'uploads', service.image.replace('/uploads/', ''));
        await fs.unlink(imagePath);
      } catch (fileError) {
        console.log('Image file not found or already deleted');
      }
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

// Toggle service status (admin only)
const toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      data: service
    });

  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service status'
    });
  }
};

// Get services for admin (admin only)
const getServicesAdmin = async (req, res) => {
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
    
    const [services, total] = await Promise.all([
      Service.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get services admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Get service stats (admin only)
const getServicesStats = async (req, res) => {
  try {
    const stats = await Service.aggregate([
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

    const categoryStats = await Service.aggregate([
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
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics'
    });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getServicesAdmin,
  getServicesStats
};