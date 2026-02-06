const { body, param, query, validationResult } = require('express-validator');

// Custom validation functions
const isIndianMobile = (value) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(value);
};

const isValidPincode = (value) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(value);
};

const isValidPassword = (value) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value);
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Admin validation rules
const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateAdminRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .custom(isValidPassword)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'technician'])
    .withMessage('Invalid role specified'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .custom(isValidPassword)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  handleValidationErrors
];

// Contact form validation
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .custom(isIndianMobile)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'service', 'complaint', 'feedback', 'support'])
    .withMessage('Invalid contact type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

// Enquiry form validation
const validateEnquiryForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .custom(isIndianMobile)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('serviceType')
    .isIn(['ro_installation', 'ro_repair', 'ro_maintenance', 'water_testing', 'consultation', 'other'])
    .withMessage('Please select a valid service type'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('address.pincode')
    .custom(isValidPincode)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Requirements cannot exceed 1000 characters'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a valid number'),
  handleValidationErrors
];

// Issue request validation
const validateIssueRequest = [
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customerInfo.email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('customerInfo.phone')
    .custom(isIndianMobile)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('issueType')
    .isIn(['no_water_flow', 'poor_water_quality', 'strange_taste', 'bad_odor', 'leakage', 'noise', 'electrical_issue', 'filter_replacement', 'maintenance', 'installation_issue', 'warranty_claim', 'other'])
    .withMessage('Please select a valid issue type'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Issue description must be between 10 and 2000 characters'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('address.pincode')
    .custom(isValidPincode)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('systemInfo.systemType')
    .isIn(['ro', 'uv', 'uf', 'gravity', 'water_cooler', 'dispenser', 'other'])
    .withMessage('Please select a valid system type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical', 'emergency'])
    .withMessage('Invalid priority level'),
  body('urgency')
    .optional()
    .isIn(['immediate', 'same_day', 'within_24_hours', 'within_week', 'flexible'])
    .withMessage('Invalid urgency level'),
  handleValidationErrors
];

// RO Part validation
const validateROPart = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Part name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['filter', 'membrane', 'pump', 'valve', 'sensor', 'electrical', 'housing', 'fitting', 'accessory', 'other'])
    .withMessage('Please select a valid category'),
  body('price.amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid positive number'),
  body('specifications.compatibility')
    .optional()
    .isArray()
    .withMessage('Compatibility must be an array'),
  body('specifications.material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material cannot exceed 100 characters'),
  handleValidationErrors
];

// Service validation
const validateService = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Service title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .isIn(['installation', 'repair', 'maintenance', 'consultation', 'testing', 'other'])
    .withMessage('Please select a valid category'),
  body('serviceType')
    .isIn(['on_site', 'pickup_delivery', 'remote', 'consultation'])
    .withMessage('Please select a valid service type'),
  body('price.amount')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid positive number'),
  body('duration.estimated')
    .optional()
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  handleValidationErrors
];

// Gallery item validation
const validateGalleryItem = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn(['installation', 'repair', 'before_after', 'product', 'team', 'facility', 'other'])
    .withMessage('Please select a valid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'price', '-price', 'priority', '-priority'])
    .withMessage('Invalid sort parameter'),
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  query('status')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Status cannot exceed 50 characters'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.startDate && value && new Date(value) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  handleValidationErrors
];

// Cookie consent validation
const validateCookieConsent = [
  body('cookieConsent')
    .isBoolean()
    .withMessage('Cookie consent must be a boolean value'),
  body('cookiePreferences')
    .optional()
    .isObject()
    .withMessage('Cookie preferences must be an object'),
  body('cookiePreferences.analytics')
    .optional()
    .isBoolean()
    .withMessage('Analytics preference must be a boolean'),
  body('cookiePreferences.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing preference must be a boolean'),
  body('cookiePreferences.functional')
    .optional()
    .isBoolean()
    .withMessage('Functional preference must be a boolean'),
  handleValidationErrors
];

module.exports = {
  // Admin validations
  validateAdminLogin,
  validateAdminRegistration,
  validatePasswordChange,
  
  // Form validations
  validateContactForm,
  validateEnquiryForm,
  validateIssueRequest,
  
  // Content validations
  validateROPart,
  validateService,
  validateGalleryItem,
  
  // Parameter validations
  validateObjectId,
  validatePagination,
  validateSearch,
  validateDateRange,
  
  // Cookie consent validation
  validateCookieConsent,
  
  // Utility
  handleValidationErrors,
  
  // Custom validators
  isIndianMobile,
  isValidPincode,
  isValidPassword
};