const Media = require('../models/Media');
const Club = require('../models/Club');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/apiResponse');

const VALID_MEDIA_TYPES = ['youtube', 'instagram', 'github', 'other'];

// @desc    Get all media for a club
// @route   GET /api/clubs/:clubId/media
// @access  Public
exports.getClubMedia = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Media.countDocuments({ clubId });
    const media = await Media.find({ clubId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    return ApiResponse.paginated(res, media, total, pageNum, limitNum, 'Media fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create media
// @route   POST /api/clubs/:clubId/media
// @access  Private/Admin
exports.createMedia = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { title, description, type, link, thumbnail } = req.body;

    // Validate required fields
    if (!clubId || !title || !type || !link) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    // Validate clubId format
    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    // Validate club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }

    // Validate title
    if (title.trim().length < 2 || title.trim().length > 200) {
      return ApiResponse.badRequest(res, 'Media title must be between 2 and 200 characters');
    }

    // Validate type
    if (!VALID_MEDIA_TYPES.includes(type)) {
      return ApiResponse.badRequest(res, `Media type must be one of: ${VALID_MEDIA_TYPES.join(', ')}`);
    }

    // Validate link URL
    if (!validators.validateURL(link)) {
      return ApiResponse.badRequest(res, 'Invalid media link URL format');
    }

    // Validate thumbnail if provided
    if (thumbnail && !validators.validateURL(thumbnail)) {
      return ApiResponse.badRequest(res, 'Invalid thumbnail URL format');
    }

    const media = await Media.create({
      clubId,
      title: title.trim(),
      description: description ? validators.sanitizeInput(description) : '',
      type,
      link,
      thumbnail: thumbnail || `https://via.placeholder.com/400x300?text=${encodeURIComponent(title.trim())}`
    });
    
    return ApiResponse.created(res, media, ERROR_MESSAGES.OPERATIONS.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Update media
// @route   PUT /api/clubs/:clubId/media/:id
// @access  Private/Admin
exports.updateMedia = async (req, res, next) => {
  try {
    const { clubId, id } = req.params;

    // Validate IDs
    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const media = await Media.findOne({
      _id: id,
      clubId
    });
    
    if (!media) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.MEDIA_NOT_FOUND);
    }

    // Validate fields if provided
    if (req.body.title && (req.body.title.trim().length < 2 || req.body.title.trim().length > 200)) {
      return ApiResponse.badRequest(res, 'Media title must be between 2 and 200 characters');
    }

    if (req.body.type && !VALID_MEDIA_TYPES.includes(req.body.type)) {
      return ApiResponse.badRequest(res, `Media type must be one of: ${VALID_MEDIA_TYPES.join(', ')}`);
    }

    if (req.body.link && !validators.validateURL(req.body.link)) {
      return ApiResponse.badRequest(res, 'Invalid media link URL format');
    }

    if (req.body.thumbnail && !validators.validateURL(req.body.thumbnail)) {
      return ApiResponse.badRequest(res, 'Invalid thumbnail URL format');
    }

    // Sanitize inputs
    if (req.body.title) {
      req.body.title = req.body.title.trim();
    }
    if (req.body.description) {
      req.body.description = validators.sanitizeInput(req.body.description);
    }

    const updatedMedia = await Media.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    return ApiResponse.success(res, updatedMedia, ERROR_MESSAGES.OPERATIONS.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media
// @route   DELETE /api/clubs/:clubId/media/:id
// @access  Private/Admin
exports.deleteMedia = async (req, res, next) => {
  try {
    const { clubId, id } = req.params;

    // Validate IDs
    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const media = await Media.findOneAndDelete({
      _id: id,
      clubId
    });
    
    if (!media) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.MEDIA_NOT_FOUND);
    }
    
    return ApiResponse.success(res, {}, ERROR_MESSAGES.OPERATIONS.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};