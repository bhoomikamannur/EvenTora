// Email validation
exports.validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password validation
exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

// Username validation
exports.validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

// Name validation
exports.validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// IIIT Dharwad email validation
exports.validateIIITEmail = (email) => {
  return email.toLowerCase().endsWith('@iiitdwd.ac.in');
};

// MongoDB ObjectId validation
exports.validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// URL validation
exports.validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Club type validation
exports.validateClubType = (type) => {
  return ['technical', 'cultural'].includes(type);
};

// Event date validation
exports.validateEventDate = (date) => {
  const eventDate = new Date(date);
  return eventDate >= new Date() && !isNaN(eventDate);
};

// Hex color validation
exports.validateColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Sanitize string input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validate paginated query
exports.validatePaginationParams = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  if (pageNum < 1 || limitNum < 1) {
    return { valid: false, error: 'Page and limit must be positive numbers' };
  }
  
  if (limitNum > 100) {
    return { valid: false, error: 'Limit cannot exceed 100' };
  }
  
  return { valid: true, page: pageNum, limit: limitNum };
};

// Validate request body
exports.validateRequiredFields = (object, requiredFields) => {
  const missingFields = requiredFields.filter(field => !object[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true };
};
