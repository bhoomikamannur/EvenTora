const ERROR_MESSAGES = {
  // Authentication
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_EXPIRED: 'Token has expired',
    NO_TOKEN: 'No authentication token provided',
    NO_AUTH: 'Not authorized to perform this action',
    ADMIN_ONLY: 'Only administrators can perform this action',
    INVALID_USER_TYPE: 'Invalid user type',
    EMAIL_EXISTS: 'Email already registered',
    USERNAME_EXISTS: 'Username already taken',
    INVALID_EMAIL_DOMAIN: 'Please use your IIIT Dharwad email (@iiitdwd.ac.in)',
    WEAK_PASSWORD: 'Password must be at least 6 characters long',
    NOT_AUTHORIZED_UPDATE: 'Not authorized to update this resource',
    NOT_AUTHORIZED_DELETE: 'Not authorized to delete this resource'
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_USERNAME: 'Username can only contain letters, numbers, and underscores (3-20 chars)',
    INVALID_NAME: 'Name must be between 2 and 100 characters',
    INVALID_PASSWORD: 'Password must be at least 6 characters',
    INVALID_OBJECT_ID: 'Invalid ID format',
    INVALID_URL: 'Invalid URL provided',
    INVALID_COLOR: 'Invalid color format (use hex: #RRGGBB)',
    INVALID_DATE: 'Invalid date provided',
    INVALID_CLUB_TYPE: 'Club type must be "technical" or "cultural"',
    PASSWORDS_MISMATCH: 'Passwords do not match',
    INVALID_PAGINATION: 'Invalid pagination parameters',
    LIMIT_EXCEEDED: 'Limit cannot exceed 100'
  },

  // Resources
  RESOURCES: {
    NOT_FOUND: 'Resource not found',
    CLUB_NOT_FOUND: 'Club not found',
    USER_NOT_FOUND: 'User not found',
    POST_NOT_FOUND: 'Post not found',
    EVENT_NOT_FOUND: 'Event not found',
    MEMBER_NOT_FOUND: 'Member not found',
    MEDIA_NOT_FOUND: 'Media not found',
    THREAD_NOT_FOUND: 'Thread not found',
    ALREADY_EXISTS: 'Resource already exists',
    ALREADY_JOINED: 'Already joined this club',
    NOT_JOINED: 'You are not a member of this club',
    ALREADY_LIKED: 'Already liked this post',
    ALREADY_RSVPD: 'Already RSVP\'d to this event',
    NOT_RSVPD: 'Not RSVP\'d to this event'
  },

  // Operations
  OPERATIONS: {
    CREATE_SUCCESS: 'Created successfully',
    UPDATE_SUCCESS: 'Updated successfully',
    DELETE_SUCCESS: 'Deleted successfully',
    CREATE_FAILED: 'Failed to create resource',
    UPDATE_FAILED: 'Failed to update resource',
    DELETE_FAILED: 'Failed to delete resource',
    OPERATION_FAILED: 'Operation failed'
  },

  // Server
  SERVER: {
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database error occurred',
    UNKNOWN_ERROR: 'An unexpected error occurred'
  }
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

module.exports = {
  ERROR_MESSAGES,
  HTTP_STATUS
};
