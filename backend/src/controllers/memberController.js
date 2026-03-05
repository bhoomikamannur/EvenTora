const Member = require('../models/Member');
const Club = require('../models/Club');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all members of a club
// @route   GET /api/clubs/:clubId/members
// @access  Public
exports.getClubMembers = async (req, res, next) => {
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

    const total = await Member.countDocuments({ clubId });
    const members = await Member.find({ clubId })
      .sort({ position: 1, name: 1 })
      .skip(skip)
      .limit(limitNum);
    
    return ApiResponse.paginated(res, members, total, pageNum, limitNum, 'Members fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to club
// @route   POST /api/clubs/:clubId/members
// @access  Private/Admin
exports.addMember = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { name, position, email } = req.body;

    // Validate required fields - only name is required
    if (!clubId || !name) {
      return ApiResponse.badRequest(res, 'Club ID and member name are required');
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

    // Validate name
    if (name.trim().length < 2 || name.trim().length > 100) {
      return ApiResponse.badRequest(res, 'Member name must be between 2 and 100 characters');
    }

    // Validate email if provided (optional)
    if (email && !validators.validateEmail(email)) {
      return ApiResponse.badRequest(res, 'Invalid email format');
    }

    // Check for duplicate email in club (only if email is provided)
    if (email) {
      const existingMember = await Member.findOne({ clubId, email: email.trim().toLowerCase() });
      if (existingMember) {
        return ApiResponse.badRequest(res, 'Member with this email already exists in the club');
      }
    }

    // Validate position if provided
    if (position && (position.trim().length < 2 || position.trim().length > 100)) {
      return ApiResponse.badRequest(res, 'Position must be between 2 and 100 characters');
    }

    const member = await Member.create({
      clubId,
      name: name.trim(),
      position: position ? position.trim() : 'Member',
      email: email.trim().toLowerCase()
    });
    
    // Increment club member count
    await Club.findByIdAndUpdate(clubId, {
      $inc: { members: 1 }
    });
    
    return ApiResponse.created(res, member, ERROR_MESSAGES.OPERATIONS.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/clubs/:clubId/members/:id
// @access  Private/Admin
exports.updateMember = async (req, res, next) => {
  try {
    const { clubId, id } = req.params;

    // Validate IDs
    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const member = await Member.findOne({
      _id: id,
      clubId
    });
    
    if (!member) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.MEMBER_NOT_FOUND);
    }

    // Validate fields if provided
    if (req.body.name && (req.body.name.trim().length < 2 || req.body.name.trim().length > 100)) {
      return ApiResponse.badRequest(res, 'Member name must be between 2 and 100 characters');
    }

    if (req.body.email) {
      if (!validators.validateEmail(req.body.email)) {
        return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
      }

      // Check for duplicate email (excluding current member)
      const existingMember = await Member.findOne({ 
        clubId, 
        email: req.body.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingMember) {
        return ApiResponse.badRequest(res, 'Member with this email already exists in the club');
      }
    }

    if (req.body.position && (req.body.position.trim().length < 2 || req.body.position.trim().length > 100)) {
      return ApiResponse.badRequest(res, 'Position must be between 2 and 100 characters');
    }

    // Sanitize inputs
    if (req.body.name) {
      req.body.name = req.body.name.trim();
    }
    if (req.body.email) {
      req.body.email = req.body.email.trim().toLowerCase();
    }
    if (req.body.position) {
      req.body.position = req.body.position.trim();
    }

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    return ApiResponse.success(res, updatedMember, ERROR_MESSAGES.OPERATIONS.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member
// @route   DELETE /api/clubs/:clubId/members/:id
// @access  Private/Admin
exports.deleteMember = async (req, res, next) => {
  try {
    const { clubId, id } = req.params;

    // Validate IDs
    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const member = await Member.findOneAndDelete({
      _id: id,
      clubId
    });
    
    if (!member) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.MEMBER_NOT_FOUND);
    }
    
    // Decrement club member count
    await Club.findByIdAndUpdate(clubId, {
      $inc: { members: -1 }
    });
    
    return ApiResponse.success(res, {}, ERROR_MESSAGES.OPERATIONS.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};