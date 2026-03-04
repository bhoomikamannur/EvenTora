/**
 * Input Validation Middleware
 */

const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { validateRequiredFields, sanitizeInput } = require('../utils/validators');

// Middleware to validate required fields
const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const validation = validateRequiredFields(req.body, requiredFields);
    
    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error,
        timestamp: new Date().toISOString()
      });
    }
    
    // Sanitize inputs
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
    
    next();
  };
};

// Middleware to validate query parameters
const validateQuery = (allowedParams) => {
  return (req, res, next) => {
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.filter(key => !allowedParams.includes(key));
    
    if (invalidParams.length > 0) {
      console.warn(`Invalid query parameters: ${invalidParams.join(', ')}`);
      // Don't fail, just log - they might be ignored parameters
    }
    
    next();
  };
};

// Middleware to validate pagination
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Page must be at least 1',
      timestamp: new Date().toISOString()
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Limit must be between 1 and 100',
      timestamp: new Date().toISOString()
    });
  }
  
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validatePagination
};
