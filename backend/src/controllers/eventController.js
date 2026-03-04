const Event = require('../models/Event');
const User = require('../models/User');
const Club = require('../models/Club');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res, next) => {
  try {
    const { clubId, date, month, page = 1, limit = 10 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    
    if (clubId) {
      if (!validators.validateObjectId(clubId)) {
        return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
      }
      query.clubId = clubId;
    }
    
    if (date) {
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return ApiResponse.badRequest(res, 'Invalid date format (use YYYY-MM-DD)');
      }
      query.date = date;
    }
    
    if (month) {
      // Validate month format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return ApiResponse.badRequest(res, 'Invalid month format (use YYYY-MM)');
      }
      query.date = { $regex: `^${month}` };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('clubId', 'name logo color')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum);
    
    return ApiResponse.paginated(res, events, total, pageNum, limitNum, 'Events fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const event = await Event.findById(id)
      .populate('clubId', 'name logo color');
    
    if (!event) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.EVENT_NOT_FOUND);
    }
    
    return ApiResponse.success(res, event, 'Event fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res, next) => {
  try {
    const { clubId, title, description, venue, date, time, isAcademic } = req.body;
    
    // Validate required fields
    if (!clubId || !title || !date || !time || !venue) {
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

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return ApiResponse.badRequest(res, 'Invalid date format (use YYYY-MM-DD)');
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return ApiResponse.badRequest(res, 'Invalid time format (use HH:MM)');
    }

    // Validate other fields
    if (title.trim().length < 3 || title.trim().length > 200) {
      return ApiResponse.badRequest(res, 'Event title must be between 3 and 200 characters');
    }

    if (venue.trim().length < 2 || venue.trim().length > 200) {
      return ApiResponse.badRequest(res, 'Venue must be between 2 and 200 characters');
    }

    const event = await Event.create({
      clubId,
      title: title.trim(),
      description: description ? validators.sanitizeInput(description) : '',
      venue: venue.trim(),
      date,
      time,
      isAcademic: isAcademic || false
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name logo color');
    
    return ApiResponse.created(res, populatedEvent, ERROR_MESSAGES.OPERATIONS.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const event = await Event.findById(id);
    
    if (!event) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.EVENT_NOT_FOUND);
    }

    // Validate fields if provided
    if (req.body.date && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
      return ApiResponse.badRequest(res, 'Invalid date format (use YYYY-MM-DD)');
    }

    if (req.body.time && !/^\d{2}:\d{2}$/.test(req.body.time)) {
      return ApiResponse.badRequest(res, 'Invalid time format (use HH:MM)');
    }

    if (req.body.title && (req.body.title.trim().length < 3 || req.body.title.trim().length > 200)) {
      return ApiResponse.badRequest(res, 'Event title must be between 3 and 200 characters');
    }

    if (req.body.venue && (req.body.venue.trim().length < 2 || req.body.venue.trim().length > 200)) {
      return ApiResponse.badRequest(res, 'Venue must be between 2 and 200 characters');
    }

    // Sanitize inputs
    if (req.body.description) {
      req.body.description = validators.sanitizeInput(req.body.description);
    }
    if (req.body.title) {
      req.body.title = req.body.title.trim();
    }
    if (req.body.venue) {
      req.body.venue = req.body.venue.trim();
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clubId', 'name logo color');
    
    return ApiResponse.success(res, updatedEvent, ERROR_MESSAGES.OPERATIONS.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.EVENT_NOT_FOUND);
    }
    
    return ApiResponse.success(res, {}, ERROR_MESSAGES.OPERATIONS.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
exports.rsvpEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const event = await Event.findById(id);
    const user = await User.findById(req.user._id);
    
    if (!event) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.EVENT_NOT_FOUND);
    }
    
    const userIdString = req.user._id.toString();
    const hasRSVPd = event.rsvpList.some(rsvpId => rsvpId.toString() === userIdString);
    
    if (hasRSVPd) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.RESOURCES.ALREADY_RSVPD);
    }
    
    event.rsvps = (event.rsvps || 0) + 1;
    event.rsvpList.push(req.user._id);
    user.rsvpEvents.push(event._id);
    
    await event.save();
    await user.save();
    
    return ApiResponse.success(res, { rsvps: event.rsvps }, 'RSVP successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
exports.cancelRSVP = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const event = await Event.findById(id);
    const user = await User.findById(req.user._id);
    
    if (!event) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.EVENT_NOT_FOUND);
    }
    
    const userIdString = req.user._id.toString();
    const hasRSVPd = event.rsvpList.some(rsvpId => rsvpId.toString() === userIdString);
    
    if (!hasRSVPd) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.RESOURCES.NOT_RSVPD);
    }
    
    event.rsvps = Math.max(0, (event.rsvps || 1) - 1);
    event.rsvpList = event.rsvpList.filter(rsvpId => rsvpId.toString() !== userIdString);
    user.rsvpEvents = user.rsvpEvents.filter(eventId => eventId.toString() !== id);
    
    await event.save();
    await user.save();
    
    return ApiResponse.success(res, { rsvps: event.rsvps }, 'RSVP cancelled successfully');
  } catch (error) {
    next(error);
  }
};