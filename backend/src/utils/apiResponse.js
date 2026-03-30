
const { HTTP_STATUS } = require('./constants');

class ApiResponse {
  static success(res, data, message = 'Operation successful', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static error(res, message, statusCode = HTTP_STATUS.INTERNAL_ERROR, details = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    });
  }

  static badRequest(res, message, details = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, details);
  }

  static unauthorized(res, message) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res, message) {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res, message) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(res, message) {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }

  static serverError(res, message = 'Internal server error') {
    return this.error(res, message, HTTP_STATUS.INTERNAL_ERROR);
  }

  static paginated(res, data, total, page, limit, message = 'Fetched successfully') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
