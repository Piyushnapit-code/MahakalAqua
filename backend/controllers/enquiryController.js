const Enquiry = require('../models/Enquiry');

// Submit enquiry form (public endpoint)
const submitEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      serviceType,
      location,
      address,
      city,
      pincode,
      propertyType,
      familySize,
      waterSource,
      currentSystem,
      issues,
      preferredDate,
      preferredTime,
      budget,
      additionalRequirements,
      message
    } = req.body;

    // Map frontend data to backend model structure
    const enquiryData = {
      name,
      email,
      phone,
      serviceType: serviceType || 'other',
      address: {
        street: address || location || '',
        city: city || '',
        pincode: pincode || ''
      },
      description: message || issues || additionalRequirements || 'No description provided',
      urgency: 'flexible',
      priority: 'medium'
    };

    // Add optional fields if provided
    if (preferredDate) {
      enquiryData.preferredDate = preferredDate;
    }
    if (preferredTime) {
      enquiryData.preferredTime = preferredTime;
    }
    if (budget) {
      // Map common budget ranges to an estimated numeric value
      const budgetMap = {
        'under-10k': 10000,
        '10k-20k': 20000,
        '20k-30k': 30000,
        '30k-50k': 50000,
        'above-50k': 75000
      };
      const normalizedBudget = String(budget).toLowerCase();
      // Avoid mixing ?? and || without parentheses (Node restriction)
      enquiryData.estimatedValue = (budgetMap[normalizedBudget] ?? parseFloat(String(budget).replace(/[^\d.]/g, ''))) || 0;
    }

    // Create notes from additional form data
    const notes = [];
    if (propertyType) notes.push(`Property Type: ${propertyType}`);
    if (familySize) notes.push(`Family Size: ${familySize}`);
    if (waterSource) notes.push(`Water Source: ${waterSource}`);
    if (currentSystem) notes.push(`Current System: ${currentSystem}`);
    if (location) notes.push(`Location: ${location}`);
    if (budget) notes.push(`Budget Range: ${budget}`);
    if (issues) notes.push(`Reported Issues: ${issues}`);
    if (additionalRequirements) notes.push(`Additional Requirements: ${additionalRequirements}`);
    
    if (notes.length > 0) {
      enquiryData.notes = notes.join('\n');
    }

    // Create enquiry
    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. Our team will contact you soon!',
      data: {
        enquiryId: enquiry._id
      }
    });

  } catch (error) {
    console.error('Submit enquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry. Please try again.',
      error: error.message
    });
  }
};

// Get all enquiries (admin only)
const getEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      serviceType,
      priority,
      search
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { serviceType: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email'),
      Enquiry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        enquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// Get single enquiry (admin only)
const getEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findById(id)
      .populate('assignedTo', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      data: enquiry
    });

  } catch (error) {
    console.error('Get enquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry'
    });
  }
};

// Update enquiry status (admin only)
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    enquiry.status = status;
    if (resolution) enquiry.resolution = resolution;
    
    await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });

  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry'
    });
  }
};

// Assign enquiry (admin only)
const assignEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry assigned successfully',
      data: enquiry
    });

  } catch (error) {
    console.error('Assign enquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign enquiry'
    });
  }
};

// Mark as read (admin only)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry marked as read',
      data: enquiry
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark enquiry as read'
    });
  }
};

// Delete enquiry (admin only)
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });

  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};

// Get enquiry stats (admin only)
const getEnquiryStats = async (req, res) => {
  try {
    const stats = await Enquiry.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
        }
      }
    ]);

    const serviceTypeStats = await Enquiry.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, unread: 0 },
        byServiceType: serviceTypeStats
      }
    });

  } catch (error) {
    console.error('Get enquiry stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry statistics'
    });
  }
};

module.exports = {
  submitEnquiry,
  getEnquiries,
  getEnquiry,
  updateEnquiryStatus,
  assignEnquiry,
  markAsRead,
  deleteEnquiry,
  getEnquiryStats
};