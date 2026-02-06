const IssueRequest = require('../models/IssueRequest');

// Submit issue request (public endpoint)
const submitIssueRequest = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      issueType,
      description,
      urgency = 'medium',
      address,
      preferredContactTime
    } = req.body;

    const issueRequest = new IssueRequest({
      customerName,
      customerEmail,
      customerPhone,
      issueType,
      description,
      urgency,
      address,
      preferredContactTime
    });

    await issueRequest.save();

    res.status(201).json({
      success: true,
      message: 'Issue request submitted successfully. We will contact you soon!',
      data: {
        requestId: issueRequest._id,
        issueType: issueRequest.issueType
      }
    });

  } catch (error) {
    console.error('Submit issue request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit issue request. Please try again.'
    });
  }
};

// Get all issue requests (admin only)
const getIssueRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      urgency,
      issueType,
      search
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (issueType) query.issueType = issueType;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [requests, total] = await Promise.all([
      IssueRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      IssueRequest.countDocuments(query)
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
    console.error('Get issue requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue requests'
    });
  }
};

// Get single issue request (admin only)
const getIssueRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await IssueRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Issue request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get issue request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue request'
    });
  }
};

// Update issue request status (admin only)
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const request = await IssueRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Issue request not found'
      });
    }

    request.status = status;
    if (notes) {
      request.notes = notes;
    }

    await request.save();

    res.json({
      success: true,
      message: 'Issue request status updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update issue request status'
    });
  }
};

// Assign issue request (admin only)
const assignIssueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const request = await IssueRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Issue request not found'
      });
    }

    request.assignedTo = assignedTo;
    await request.save();

    res.json({
      success: true,
      message: 'Issue request assigned successfully',
      data: request
    });

  } catch (error) {
    console.error('Assign issue request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign issue request'
    });
  }
};

// Mark issue request as read (admin only)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await IssueRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Issue request not found'
      });
    }

    request.isRead = true;
    await request.save();

    res.json({
      success: true,
      message: 'Issue request marked as read',
      data: request
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark issue request as read'
    });
  }
};

// Delete issue request (admin only)
const deleteIssueRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await IssueRequest.findByIdAndDelete(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Issue request not found'
      });
    }

    res.json({
      success: true,
      message: 'Issue request deleted successfully'
    });

  } catch (error) {
    console.error('Delete issue request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete issue request'
    });
  }
};

// Get issue request statistics (admin only)
const getIssueStats = async (req, res) => {
  try {
    const stats = await IssueRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
        }
      }
    ]);

    const urgencyStats = await IssueRequest.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const issueTypeStats = await IssueRequest.aggregate([
      {
        $group: {
          _id: '$issueType',
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
          pending: 0, 
          inProgress: 0, 
          resolved: 0, 
          closed: 0, 
          unread: 0 
        },
        byUrgency: urgencyStats,
        byIssueType: issueTypeStats
      }
    });

  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue statistics'
    });
  }
};

module.exports = {
  submitIssueRequest,
  getIssueRequests,
  getIssueRequest,
  updateIssueStatus,
  assignIssueRequest,
  markAsRead,
  deleteIssueRequest,
  getIssueStats
};