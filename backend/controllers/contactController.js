const ContactRequest = require('../models/ContactRequest');

// Submit contact form (public endpoint)
const submitContactForm = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      contactType = 'general',
      priority = 'medium',
      preferredDate,
      preferredTime
    } = req.body;

    // Create contact request
    const contactRequest = new ContactRequest({
      name,
      email,
      phone,
      subject,
      message,
      contactType,
      priority
    });

    await contactRequest.save();

    res.status(201).json({
      success: true,
      message: 'Contact request submitted successfully. We will get back to you soon!',
      data: {
        requestId: contactRequest._id
      }
    });

  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact request. Please try again.'
    });
  }
};

// Get all contact requests (admin only)
const getContactRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      contactType,
      priority,
      search
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (contactType) query.contactType = contactType;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [requests, total] = await Promise.all([
      ContactRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email'),
      ContactRequest.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get contact requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact requests'
    });
  }
};

// Get single contact request (admin only)
const getContactRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ContactRequest.findById(id)
      .populate('assignedTo', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact request'
    });
  }
};

// Update contact status (admin only)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const request = await ContactRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    request.status = status;
    if (resolution) request.resolution = resolution;
    
    await request.save();

    res.json({
      success: true,
      message: 'Contact request updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact request'
    });
  }
};

// Assign contact request (admin only)
const assignContactRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const request = await ContactRequest.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact request assigned successfully',
      data: request
    });

  } catch (error) {
    console.error('Assign contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign contact request'
    });
  }
};

// Mark as read (admin only)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ContactRequest.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact request marked as read',
      data: request
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark contact request as read'
    });
  }
};

// Delete contact request (admin only)
const deleteContactRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ContactRequest.findByIdAndDelete(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact request deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact request'
    });
  }
};

// Get contact stats (admin only)
const getContactStats = async (req, res) => {
  try {
    const stats = await ContactRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
        }
      }
    ]);

    const contactTypeStats = await ContactRequest.aggregate([
      {
        $group: {
          _id: '$contactType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, unread: 0 },
        byType: contactTypeStats
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};

module.exports = {
  submitContactForm,
  getContactRequests,
  getContactRequest,
  updateContactStatus,
  assignContactRequest,
  markAsRead,
  deleteContactRequest,
  getContactStats
};