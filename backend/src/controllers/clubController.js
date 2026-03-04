const Club = require('../models/Club');
const User = require('../models/User');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
exports.getAllClubs = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    
    // Validate club type if provided
    if (type) {
      if (!validators.validateClubType(type)) {
        return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_CLUB_TYPE);
      }
      query.type = type;
    }
    
    // Search by name
    if (search && search.trim()) {
      query.name = { $regex: validators.sanitizeInput(search), $options: 'i' };
    }

    const total = await Club.countDocuments(query);
    const clubs = await Club.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    return ApiResponse.paginated(res, clubs, total, pageNum, limitNum, 'Clubs fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
exports.getClubById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const club = await Club.findById(id);
    
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }
    
    return ApiResponse.success(res, club, 'Club fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create club
// @route   POST /api/clubs
// @access  Private/Admin
exports.createClub = async (req, res, next) => {
  try {
    const { name, type, color, description, logo } = req.body;

    // Validate required fields
    if (!name || !type) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    // Validate club name
    if (name.trim().length < 2 || name.trim().length > 100) {
      return ApiResponse.badRequest(res, 'Club name must be between 2 and 100 characters');
    }

    // Validate club type
    if (!validators.validateClubType(type)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_CLUB_TYPE);
    }

    // Validate color if provided
    if (color && !validators.validateColor(color)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_COLOR);
    }

    // Check if club name already exists
    const existingClub = await Club.findOne({ name: name.trim() });
    if (existingClub) {
      return ApiResponse.conflict(res, 'Club with this name already exists');
    }

    const clubData = {
      name: name.trim(),
      type,
      description: description ? validators.sanitizeInput(description) : '',
      color: color || '#ab83c3',
      logo: logo || '🎯'
    };

    const club = await Club.create(clubData);
    return ApiResponse.created(res, club, ERROR_MESSAGES.OPERATIONS.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private/Admin
exports.updateClub = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const club = await Club.findById(id);
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }

    // Validate fields if provided
    if (req.body.name) {
      if (req.body.name.trim().length < 2 || req.body.name.trim().length > 100) {
        return ApiResponse.badRequest(res, 'Club name must be between 2 and 100 characters');
      }
      
      const existing = await Club.findOne({ name: req.body.name.trim(), _id: { $ne: id } });
      if (existing) {
        return ApiResponse.conflict(res, 'Club with this name already exists');
      }
    }

    if (req.body.type && !validators.validateClubType(req.body.type)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_CLUB_TYPE);
    }

    if (req.body.color && !validators.validateColor(req.body.color)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_COLOR);
    }

    if (req.body.description) {
      req.body.description = validators.sanitizeInput(req.body.description);
    }

    if (req.body.name) {
      req.body.name = req.body.name.trim();
    }

    const updatedClub = await Club.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    return ApiResponse.success(res, updatedClub, ERROR_MESSAGES.OPERATIONS.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
exports.deleteClub = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const club = await Club.findByIdAndDelete(id);
    
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }
    
    return ApiResponse.success(res, {}, ERROR_MESSAGES.OPERATIONS.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
exports.joinClub = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const user = await User.findById(req.user._id);
    const club = await Club.findById(id);
    
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }

    // Admins cannot join clubs they don't manage
    if (user.userType === 'admin' && user.adminClubId?.toString() !== id) {
      return ApiResponse.forbidden(res, 'Admins can only join their assigned club. You are managing a different community.');
    }

    // Admins should not join their own admin club (they manage it)
    if (user.userType === 'admin' && user.adminClubId?.toString() === id) {
      return ApiResponse.badRequest(res, 'You manage this community. You do not need to join it.');
    }
    
    // Check if already joined
    const alreadyJoined = user.joinedClubs.some(clubId => clubId.toString() === id);
    if (alreadyJoined) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.RESOURCES.ALREADY_JOINED);
    }
    
    // Add club to user's joined clubs
    user.joinedClubs.push(club._id);
    await user.save();
    
    // Increment club member count
    club.communityMembers = (club.communityMembers || 0) + 1;
    await club.save();

    const updatedUser = await User.findById(user._id).populate('joinedClubs');
    return ApiResponse.success(res, { user: updatedUser }, 'Joined club successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
exports.leaveClub = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const user = await User.findById(req.user._id);
    const club = await Club.findById(id);
    
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }
    
    // Check if user is member
    const isMember = user.joinedClubs.some(clubId => clubId.toString() === id);
    if (!isMember) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.RESOURCES.NOT_JOINED);
    }
    
    // Remove club from user's joined clubs
    user.joinedClubs = user.joinedClubs.filter(
      clubId => clubId.toString() !== club._id.toString()
    );
    await user.save();
    
    // Decrement club member count
    club.communityMembers = Math.max(0, (club.communityMembers || 1) - 1);
    await club.save();
    
    return ApiResponse.success(res, {}, 'Left club successfully');
  } catch (error) {
    next(error);
  }
};