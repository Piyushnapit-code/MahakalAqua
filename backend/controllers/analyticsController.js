const Visit = require('../models/Visit');
const ContactRequest = require('../models/ContactRequest');
const Enquiry = require('../models/Enquiry');
const IssueRequest = require('../models/IssueRequest');
const Service = require('../models/Service');
const ROPart = require('../models/ROPart');
const GalleryItem = require('../models/GalleryItem');

// Get dashboard overview (admin only)
const getDashboardOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const dateFilter = { createdAt: { $gte: startDate, $lte: now } };

    // Calculate previous period for comparisons (same length as current range)
    const rangeMs = now.getTime() - startDate.getTime();
    const prevPeriodEnd = startDate;
    const prevPeriodStart = new Date(startDate.getTime() - rangeMs);

    // Get basic visitor stats
    const visitorStats = await Visit.aggregate([
      { $match: { ...dateFilter, isBot: false } },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          totalPageViews: { $sum: '$pageViews' }
        }
      },
      {
        $project: {
          totalVisits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          totalPageViews: 1
        }
      }
    ]);
    
    // Get contact requests stats
    const contactStats = await ContactRequest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);

    // Get enquiries stats
    const enquiryStats = await Enquiry.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);

    // Get issue requests stats
    const issueStats = await IssueRequest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);

    // Get content stats, revenue and recent activities
    const [
      activeServices,
      activeParts,
      activeGalleryItems,
      currentRevenueAgg,
      previousRevenueAgg,
      recentContacts,
      recentEnquiries,
      recentIssues
    ] = await Promise.all([
      Service.countDocuments({ isActive: true }),
      ROPart.countDocuments({ isActive: true }),
      GalleryItem.countDocuments({ isActive: true }),
      // Current period revenue: sum of estimatedValue for completed enquiries
      Enquiry.aggregate([
        { 
          $match: { 
            ...dateFilter,
            status: 'completed',
            estimatedValue: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$estimatedValue' }
          }
        }
      ]),
      // Previous period revenue for percentage change
      Enquiry.aggregate([
        { 
          $match: { 
            createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd },
            status: 'completed',
            estimatedValue: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$estimatedValue' }
          }
        }
      ]),
      ContactRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email contactType status createdAt'),
      Enquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email serviceType status createdAt'),
      IssueRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('ticketNumber issueType priority status createdAt')
    ]);

    const currentRevenue = currentRevenueAgg[0]?.total || 0;
    const previousRevenue = previousRevenueAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        period,
        visitors: visitorStats[0] || { totalVisits: 0, uniqueVisitors: 0, totalPageViews: 0 },
        contacts: contactStats[0] || { total: 0, pending: 0, resolved: 0 },
        enquiries: enquiryStats[0] || { total: 0, pending: 0, converted: 0 },
        issues: issueStats[0] || { total: 0, open: 0, resolved: 0 },
        revenue: {
          current: currentRevenue,
          previous: previousRevenue
        },
        content: {
          services: activeServices,
          parts: activeParts,
          galleryItems: activeGalleryItems
        },
        recentActivities: {
          contacts: recentContacts,
          enquiries: recentEnquiries,
          issues: recentIssues
        }
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview'
    });
  }
};

// Get revenue analytics for chart
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = {
      createdAt: { $gte: startDate, $lte: now },
      status: 'completed',
      estimatedValue: { $gt: 0 }
    };

    const revenueByDate = await Enquiry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$estimatedValue' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        points: revenueByDate
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics'
    });
  }
};

// Get basic visitor analytics
const getVisitorAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get visits by date
    const visitsByDate = await Visit.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          isBot: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          pageViews: { $sum: '$pageViews' }
        }
      },
      {
        $project: {
          date: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          pageViews: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get device breakdown
    const deviceBreakdown = await Visit.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          isBot: false
        }
      },
      {
        $group: {
          _id: '$device.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get traffic sources
    const trafficSources = await Visit.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          isBot: false
        }
      },
      {
        $group: {
          _id: '$trafficSource',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        visitsByDate,
        deviceBreakdown,
        trafficSources
      }
    });

  } catch (error) {
    console.error('Visitor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor analytics'
    });
  }
};

// Get all visitors for admin panel
const getAllVisitors = async (req, res) => {
  console.log('🔍 getAllVisitors function called');
  try {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    console.log('📊 Query params:', { page, limit, search, sortBy, sortOrder });
    const skip = (page - 1) * limit;

    let query = {
      isBot: false
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { 'contactInfo.phoneNumber': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const visitors = await Visit.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId ipAddress contactInfo location device createdAt updatedAt lastActivity pageViews visitCount userAgent referrer language trafficSource isNewVisitor');

    const total = await Visit.countDocuments(query);

    // Get statistics
    const stats = await Visit.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalVisitors: { $sum: 1 },
          totalPageViews: { $sum: '$pageViews' },
          avgPageViews: { $avg: '$pageViews' },
          uniqueCountries: { $addToSet: '$location.country' },
          uniqueCities: { $addToSet: '$location.city' },
          visitorsWithContact: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$contactInfo.phoneNumber', null] },
                    { $ne: ['$contactInfo.phoneNumber', ''] },
                    { $eq: ['$contactInfo.consentGiven', true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          visitorsWithLocation: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$location.latitude', null] },
                    { $ne: ['$location.longitude', null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalVisitors: 1,
          totalPageViews: 1,
          avgPageViews: { $round: ['$avgPageViews', 2] },
          uniqueCountries: { $size: '$uniqueCountries' },
          uniqueCities: { $size: '$uniqueCities' },
          visitorsWithContact: 1,
          visitorsWithLocation: 1
        }
      }
    ]);

    res.json({
      success: true,
      visitors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        totalVisitors: 0,
        totalPageViews: 0,
        avgPageViews: 0,
        uniqueCountries: 0,
        uniqueCities: 0,
        visitorsWithContact: 0,
        visitorsWithLocation: 0
      }
    });
  } catch (error) {
    console.error('Error getting all visitors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitors'
    });
  }
};

// Get visitors with contact information for admin panel
const getVisitorsWithContact = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      'contactInfo.phoneNumber': { $exists: true, $nin: [null, ''] },
      'contactInfo.consentGiven': true,
      isBot: false
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { 'contactInfo.phoneNumber': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const visitors = await Visit.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId ipAddress contactInfo location device createdAt updatedAt lastActivity pageViews visitCount userAgent referrer language trafficSource isNewVisitor');

    const total = await Visit.countDocuments(query);

    // Get statistics
    const stats = await Visit.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalVisitors: { $sum: 1 },
          totalPageViews: { $sum: '$pageViews' },
          avgPageViews: { $avg: '$pageViews' },
          uniqueCountries: { $addToSet: '$location.country' },
          uniqueCities: { $addToSet: '$location.city' }
        }
      },
      {
        $project: {
          totalVisitors: 1,
          totalPageViews: 1,
          avgPageViews: { $round: ['$avgPageViews', 2] },
          uniqueCountries: { $size: '$uniqueCountries' },
          uniqueCities: { $size: '$uniqueCities' }
        }
      }
    ]);

    res.json({
      success: true,
      visitors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        totalVisitors: 0,
        totalPageViews: 0,
        avgPageViews: 0,
        uniqueCountries: 0,
        uniqueCities: 0
      }
    });
  } catch (error) {
    console.error('Error getting visitors with contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitors with contact information'
    });
  }
};

// Get visitor location analytics
const getLocationAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const dateFilter = { 
      createdAt: { $gte: startDate, $lte: now },
      isBot: false,
      'location.country': { $exists: true, $ne: null }
    };

    // Get visitors by country
    const countryStats = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$location.country',
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          pageViews: { $sum: '$pageViews' },
          withContact: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$contactInfo.phoneNumber', null] },
                  { $ne: ['$contactInfo.phoneNumber', ''] },
                  { $eq: ['$contactInfo.consentGiven', true] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          country: '$_id',
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          pageViews: 1,
          withContact: 1
        }
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);

    // Get visitors by city
    const cityStats = await Visit.aggregate([
      { $match: { ...dateFilter, 'location.city': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            city: '$location.city',
            country: '$location.country'
          },
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          withContact: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$contactInfo.phoneNumber', null] },
                  { $ne: ['$contactInfo.phoneNumber', ''] },
                  { $eq: ['$contactInfo.consentGiven', true] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          city: '$_id.city',
          country: '$_id.country',
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          withContact: 1
        }
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      countryStats,
      cityStats
    });
  } catch (error) {
    console.error('Error getting location analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location analytics'
    });
  }
};

module.exports = {
  getDashboardOverview,
  getRevenueAnalytics,
  getVisitorAnalytics,
  getAllVisitors,
  getVisitorsWithContact,
  getLocationAnalytics
};