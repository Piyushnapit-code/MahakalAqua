const XLSX = require('xlsx');
const ContactRequest = require('../models/ContactRequest');
const Enquiry = require('../models/Enquiry');
const IssueRequest = require('../models/IssueRequest');
const Service = require('../models/Service');
const ROPart = require('../models/ROPart');
const GalleryItem = require('../models/GalleryItem');
const Visit = require('../models/Visit');
const Admin = require('../models/Admin');

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Export Contact Requests to Excel
const exportContacts = async (req, res) => {
  try {
    const contacts = await ContactRequest.find({})
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const data = contacts.map(contact => ({
      'ID': contact._id.toString(),
      'Name': contact.name || '',
      'Email': contact.email || '',
      'Phone': contact.phone || '',
      'Subject': contact.subject || '',
      'Message': contact.message || '',
      'Contact Type': contact.contactType || '',
      'Status': contact.status || '',
      'Priority': contact.priority || '',
      'Is Read': contact.isRead ? 'Yes' : 'No',
      'Assigned To': contact.assignedTo ? contact.assignedTo.name : '',
      'Resolution': contact.resolution || '',
      'Created At': formatDate(contact.createdAt),
      'Updated At': formatDate(contact.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Requests');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=contact-requests-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export contact requests'
    });
  }
};

// Export Enquiries to Excel
const exportEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({})
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const data = enquiries.map(enquiry => ({
      'ID': enquiry._id.toString(),
      'Name': enquiry.name || '',
      'Email': enquiry.email || '',
      'Phone': enquiry.phone || '',
      'Service Type': enquiry.serviceType || '',
      'Address': enquiry.address ? `${enquiry.address.street}, ${enquiry.address.city} - ${enquiry.address.pincode}` : '',
      'City': enquiry.address?.city || '',
      'Pincode': enquiry.address?.pincode || '',
      'Description': enquiry.description || '',
      'Urgency': enquiry.urgency || '',
      'Status': enquiry.status || '',
      'Priority': enquiry.priority || '',
      'Is Read': enquiry.isRead ? 'Yes' : 'No',
      'Assigned To': enquiry.assignedTo ? enquiry.assignedTo.name : '',
      'Estimated Value': enquiry.estimatedValue || '',
      'Preferred Date': enquiry.preferredDate || '',
      'Preferred Time': enquiry.preferredTime || '',
      'Notes': enquiry.notes || '',
      'Created At': formatDate(enquiry.createdAt),
      'Updated At': formatDate(enquiry.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=enquiries-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export enquiries'
    });
  }
};

// Export Issues to Excel
const exportIssues = async (req, res) => {
  try {
    const issues = await IssueRequest.find({})
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const data = issues.map(issue => ({
      'Ticket Number': issue.ticketNumber || '',
      'ID': issue._id.toString(),
      'Customer Name': issue.customerName || '',
      'Customer Email': issue.customerEmail || '',
      'Customer Phone': issue.customerPhone || '',
      'Issue Type': issue.issueType || '',
      'Priority': issue.priority || '',
      'Description': issue.description || '',
      'Address': issue.address ? `${issue.address.street}, ${issue.address.city} - ${issue.address.pincode}` : '',
      'City': issue.address?.city || '',
      'Pincode': issue.address?.pincode || '',
      'System Type': issue.systemType || '',
      'Status': issue.status || '',
      'Is Emergency': issue.isEmergency ? 'Yes' : 'No',
      'Assigned To': issue.assignedTo ? issue.assignedTo.name : '',
      'Estimated Cost': issue.estimatedCost || '',
      'Resolution': issue.resolution || '',
      'Customer Rating': issue.customerRating || '',
      'Created At': formatDate(issue.createdAt),
      'Updated At': formatDate(issue.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Issues');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=issues-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export issues'
    });
  }
};

// Export Services to Excel
const exportServices = async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });

    const data = services.map(service => ({
      'ID': service._id.toString(),
      'Title': service.title || '',
      'Description': service.description || '',
      'Category': service.category || '',
      'Price': service.price || '',
      'Duration': service.duration || '',
      'Features': Array.isArray(service.features) ? service.features.join(', ') : '',
      'Service Areas': Array.isArray(service.serviceAreas) ? service.serviceAreas.join(', ') : '',
      'Featured': service.featured ? 'Yes' : 'No',
      'Is Active': service.isActive ? 'Yes' : 'No',
      'Image URL': service.image?.url || '',
      'Created At': formatDate(service.createdAt),
      'Updated At': formatDate(service.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=services-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export services'
    });
  }
};

// Export RO Parts to Excel
const exportROParts = async (req, res) => {
  try {
    const roParts = await ROPart.find({}).sort({ createdAt: -1 });

    const data = roParts.map(part => ({
      'ID': part._id.toString(),
      'Name': part.name || '',
      'Description': part.description || '',
      'Brand': part.brand || '',
      'Model': part.model || '',
      'Price': part.price || '',
      'Original Price': part.originalPrice || '',
      'Category': part.category || '',
      'In Stock': part.inStock ? 'Yes' : 'No',
      'Stock Quantity': part.stockQuantity || 0,
      'Compatibility': Array.isArray(part.compatibility) ? part.compatibility.join(', ') : '',
      'Image URL': part.image?.url || '',
      'Created At': formatDate(part.createdAt),
      'Updated At': formatDate(part.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RO Parts');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=ro-parts-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export RO parts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export RO parts'
    });
  }
};

// Export Gallery Items to Excel
const exportGallery = async (req, res) => {
  try {
    const galleryItems = await GalleryItem.find({}).sort({ createdAt: -1 });

    const data = galleryItems.map(item => ({
      'ID': item._id.toString(),
      'Title': item.title || '',
      'Description': item.description || '',
      'Category': item.category || '',
      'Location': item.location || '',
      'Date': item.date ? formatDate(item.date) : '',
      'Customer Name': item.customerName || '',
      'Rating': item.rating || '',
      'Tags': Array.isArray(item.tags) ? item.tags.join(', ') : '',
      'Is Active': item.isActive ? 'Yes' : 'No',
      'Image URL': item.image?.url || '',
      'Created At': formatDate(item.createdAt),
      'Updated At': formatDate(item.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gallery Items');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=gallery-items-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export gallery items'
    });
  }
};

// Export Visitors to Excel
const exportVisitors = async (req, res) => {
  try {
    const { hasContact, hasLocation, dateRange, search, device, trafficSource } = req.query;
    
    // Build query with filters
    let query = { isBot: false };
    
    // Filter by contact info
    if (hasContact === 'true') {
      query['contactInfo.phoneNumber'] = { $exists: true, $nin: [null, ''] };
      query['contactInfo.consentGiven'] = true;
    }
    
    // Filter by location
    if (hasLocation === 'true') {
      query['location.country'] = { $exists: true, $ne: null };
    }
    
    // Filter by date range
    if (dateRange) {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
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
      query.createdAt = { $gte: startDate, $lte: now };
    }
    
    // Filter by device type
    if (device) {
      query['device.type'] = device;
    }
    
    // Filter by traffic source
    if (trafficSource) {
      query.trafficSource = trafficSource;
    }
    
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
    
    const visitors = await Visit.find(query).sort({ createdAt: -1 }).limit(50000); // Limit to prevent huge files

    const data = visitors.map(visit => ({
      'ID': visit._id.toString(),
      'Session ID': visit.sessionId || '',
      'IP Address': visit.ipAddress || '',
      'User Agent': visit.userAgent || '',
      'Page/Path': visit.path || '',
      'Referrer': visit.referrer || 'direct',
      'Country': visit.location?.country || '',
      'City': visit.location?.city || '',
      'State': visit.location?.state || '',
      'Device Type': visit.device?.type || 'unknown',
      'Browser': visit.device?.browser || 'Unknown',
      'OS': visit.device?.os || 'Unknown',
      'Language': visit.language || '',
      'Is New Visitor': visit.isNewVisitor ? 'Yes' : 'No',
      'Visit Count': visit.visitCount || 1,
      'Page Views': visit.pageViews || 1,
      'Traffic Source': visit.trafficSource || 'direct',
      'Is Bot': visit.isBot ? 'Yes' : 'No',
      'Phone Number': visit.contactInfo?.phoneNumber || '',
      'Country Code': visit.contactInfo?.countryCode || '',
      'Phone Verified': visit.contactInfo?.isPhoneVerified ? 'Yes' : 'No',
      'Consent Given': visit.contactInfo?.consentGiven ? 'Yes' : 'No',
      'Is Active': visit.isActive ? 'Yes' : 'No',
      'Last Activity': formatDate(visit.lastActivity),
      'Created At': formatDate(visit.createdAt),
      'Updated At': formatDate(visit.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=visitors-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export visitors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export visitors',
      error: error.message
    });
  }
};

// Export All Data to Excel (Multiple Sheets)
const exportAll = async (req, res) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Export Contacts
    const contacts = await ContactRequest.find({})
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    const contactsData = contacts.map(contact => ({
      'ID': contact._id.toString(),
      'Name': contact.name || '',
      'Email': contact.email || '',
      'Phone': contact.phone || '',
      'Subject': contact.subject || '',
      'Message': contact.message || '',
      'Contact Type': contact.contactType || '',
      'Status': contact.status || '',
      'Priority': contact.priority || '',
      'Is Read': contact.isRead ? 'Yes' : 'No',
      'Assigned To': contact.assignedTo ? contact.assignedTo.name : '',
      'Resolution': contact.resolution || '',
      'Created At': formatDate(contact.createdAt),
      'Updated At': formatDate(contact.updatedAt)
    }));
    const contactsSheet = XLSX.utils.json_to_sheet(contactsData);
    XLSX.utils.book_append_sheet(workbook, contactsSheet, 'Contacts');

    // Export Enquiries
    const enquiries = await Enquiry.find({})
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    const enquiriesData = enquiries.map(enquiry => ({
      'ID': enquiry._id.toString(),
      'Name': enquiry.name || '',
      'Email': enquiry.email || '',
      'Phone': enquiry.phone || '',
      'Service Type': enquiry.serviceType || '',
      'Address': enquiry.address ? `${enquiry.address.street}, ${enquiry.address.city} - ${enquiry.address.pincode}` : '',
      'City': enquiry.address?.city || '',
      'Pincode': enquiry.address?.pincode || '',
      'Description': enquiry.description || '',
      'Status': enquiry.status || '',
      'Priority': enquiry.priority || '',
      'Estimated Value': enquiry.estimatedValue || '',
      'Created At': formatDate(enquiry.createdAt),
      'Updated At': formatDate(enquiry.updatedAt)
    }));
    const enquiriesSheet = XLSX.utils.json_to_sheet(enquiriesData);
    XLSX.utils.book_append_sheet(workbook, enquiriesSheet, 'Enquiries');

    // Export Issues
    const issues = await IssueRequest.find({})
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    const issuesData = issues.map(issue => ({
      'Ticket Number': issue.ticketNumber || '',
      'ID': issue._id.toString(),
      'Customer Name': issue.customerName || '',
      'Customer Email': issue.customerEmail || '',
      'Customer Phone': issue.customerPhone || '',
      'Issue Type': issue.issueType || '',
      'Priority': issue.priority || '',
      'Status': issue.status || '',
      'Is Emergency': issue.isEmergency ? 'Yes' : 'No',
      'Assigned To': issue.assignedTo ? issue.assignedTo.name : '',
      'Estimated Cost': issue.estimatedCost || '',
      'Created At': formatDate(issue.createdAt),
      'Updated At': formatDate(issue.updatedAt)
    }));
    const issuesSheet = XLSX.utils.json_to_sheet(issuesData);
    XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Issues');

    // Export Services
    const services = await Service.find({}).sort({ createdAt: -1 });
    const servicesData = services.map(service => ({
      'ID': service._id.toString(),
      'Title': service.title || '',
      'Description': service.description || '',
      'Category': service.category || '',
      'Price': service.price || '',
      'Duration': service.duration || '',
      'Is Active': service.isActive ? 'Yes' : 'No',
      'Created At': formatDate(service.createdAt),
      'Updated At': formatDate(service.updatedAt)
    }));
    const servicesSheet = XLSX.utils.json_to_sheet(servicesData);
    XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Services');

    // Export RO Parts
    const roParts = await ROPart.find({}).sort({ createdAt: -1 });
    const roPartsData = roParts.map(part => ({
      'ID': part._id.toString(),
      'Name': part.name || '',
      'Brand': part.brand || '',
      'Model': part.model || '',
      'Price': part.price || '',
      'Category': part.category || '',
      'In Stock': part.inStock ? 'Yes' : 'No',
      'Stock Quantity': part.stockQuantity || 0,
      'Created At': formatDate(part.createdAt),
      'Updated At': formatDate(part.updatedAt)
    }));
    const roPartsSheet = XLSX.utils.json_to_sheet(roPartsData);
    XLSX.utils.book_append_sheet(workbook, roPartsSheet, 'RO Parts');

    // Export Gallery
    const galleryItems = await GalleryItem.find({}).sort({ createdAt: -1 });
    const galleryData = galleryItems.map(item => ({
      'ID': item._id.toString(),
      'Title': item.title || '',
      'Category': item.category || '',
      'Location': item.location || '',
      'Customer Name': item.customerName || '',
      'Rating': item.rating || '',
      'Is Active': item.isActive ? 'Yes' : 'No',
      'Created At': formatDate(item.createdAt),
      'Updated At': formatDate(item.updatedAt)
    }));
    const gallerySheet = XLSX.utils.json_to_sheet(galleryData);
    XLSX.utils.book_append_sheet(workbook, gallerySheet, 'Gallery');

    // Export Visitors
    const visitors = await Visit.find({}).sort({ createdAt: -1 }).limit(10000); // Limit to prevent huge files
    const visitorsData = visitors.map(visit => ({
      'ID': visit._id.toString(),
      'Session ID': visit.sessionId || '',
      'IP Address': visit.ipAddress || '',
      'Page/Path': visit.path || '',
      'Country': visit.location?.country || '',
      'City': visit.location?.city || '',
      'Device Type': visit.device?.type || 'unknown',
      'Browser': visit.device?.browser || 'Unknown',
      'OS': visit.device?.os || 'Unknown',
      'Traffic Source': visit.trafficSource || 'direct',
      'Is Bot': visit.isBot ? 'Yes' : 'No',
      'Phone Number': visit.contactInfo?.phoneNumber || '',
      'Created At': formatDate(visit.createdAt)
    }));
    const visitorsSheet = XLSX.utils.json_to_sheet(visitorsData);
    XLSX.utils.book_append_sheet(workbook, visitorsSheet, 'Visitors');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=all-data-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export all data'
    });
  }
};

module.exports = {
  exportContacts,
  exportEnquiries,
  exportIssues,
  exportServices,
  exportROParts,
  exportGallery,
  exportVisitors,
  exportAll
};

