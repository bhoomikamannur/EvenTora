const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldMessages = {
      email: ERROR_MESSAGES.AUTH.EMAIL_EXISTS,
      username: ERROR_MESSAGES.AUTH.USERNAME_EXISTS
    };
    
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: fieldMessages[field] || `${field} already exists`,
      field,
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose cast error (invalid MongoDB ID)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID,
      timestamp: new Date().toISOString()
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.AUTH.INVALID_TOKEN,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.AUTH.TOKEN_EXPIRED,
      timestamp: new Date().toISOString()
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { details: err.details }),
      timestamp: new Date().toISOString()
    });
  }

  // Default error
  const statusCode = err.status || HTTP_STATUS.INTERNAL_ERROR;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err,
      stack: err.stack 
    }),
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;