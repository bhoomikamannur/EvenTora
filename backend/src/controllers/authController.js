const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user (Student signup)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, username, name, userType, adminClubId } = req.body;

    // Validate required fields
    if (!email || !password || !username || !name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        timestamp: new Date().toISOString()
      });
    }

    // Validate email format
    if (!validators.validateEmail(email)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
        timestamp: new Date().toISOString()
      });
    }

    // Validate IIIT email domain
    if (!validators.validateIIITEmail(email)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.INVALID_EMAIL_DOMAIN,
        timestamp: new Date().toISOString()
      });
    }

    // Validate password
    if (!validators.validatePassword(password)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
        timestamp: new Date().toISOString()
      });
    }

    // Validate username
    if (!validators.validateUsername(username)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.INVALID_USERNAME,
        timestamp: new Date().toISOString()
      });
    }

    // Validate name
    if (!validators.validateName(name)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.INVALID_NAME,
        timestamp: new Date().toISOString()
      });
    }

    // Check if user exists by email
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.EMAIL_EXISTS,
        timestamp: new Date().toISOString()
      });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.USERNAME_EXISTS,
        timestamp: new Date().toISOString()
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username: username.toLowerCase(),
      name: name.trim(),
      userType: userType || 'student',
      adminClubId: userType === 'admin' ? adminClubId : null
    });

    // Return user data with token
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        userType: user.userType,
        adminClubId: user.adminClubId,
        token: generateToken(user._id)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password || !userType) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        timestamp: new Date().toISOString()
      });
    }

    // Validate email format
    if (!validators.validateEmail(email)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
        timestamp: new Date().toISOString()
      });
    }

    // Validate password is provided
    if (password.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
        timestamp: new Date().toISOString()
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        timestamp: new Date().toISOString()
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        timestamp: new Date().toISOString()
      });
    }

    // Check user type matches
    if (user.userType !== userType) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.INVALID_USER_TYPE,
        timestamp: new Date().toISOString()
      });
    }

    // Return user data with token
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        userType: user.userType,
        adminClubId: user.adminClubId,
        joinedClubs: user.joinedClubs,
        likedPosts: user.likedPosts,
        rsvpEvents: user.rsvpEvents,
        token: generateToken(user._id)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.AUTH.NO_AUTH,
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('joinedClubs');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.RESOURCES.USER_NOT_FOUND,
        timestamp: new Date().toISOString()
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.RESOURCES.USER_NOT_FOUND,
        timestamp: new Date().toISOString()
      });
    }

    // Validate name if provided
    if (req.body.name && !validators.validateName(req.body.name)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.INVALID_NAME,
        timestamp: new Date().toISOString()
      });
    }

    // Validate email if provided
    if (req.body.email) {
      if (!validators.validateEmail(req.body.email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
          timestamp: new Date().toISOString()
        });
      }

      if (!validators.validateIIITEmail(req.body.email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.AUTH.INVALID_EMAIL_DOMAIN,
          timestamp: new Date().toISOString()
        });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: req.user._id }
      });

      if (existingEmail) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: ERROR_MESSAGES.AUTH.EMAIL_EXISTS,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update name
    if (req.body.name) {
      user.name = req.body.name.trim();
    }

    // Update email
    if (req.body.email) {
      user.email = req.body.email.toLowerCase();
    }

    // Update username if provided
    if (req.body.username) {
      if (!validators.validateUsername(req.body.username)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION.INVALID_USERNAME,
          timestamp: new Date().toISOString()
        });
      }

      // Check if username is already taken
      const existingUser = await User.findOne({
        username: req.body.username.toLowerCase(),
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: ERROR_MESSAGES.AUTH.USERNAME_EXISTS,
          timestamp: new Date().toISOString()
        });
      }

      user.username = req.body.username.toLowerCase();
    }

    // Update password if provided
    if (req.body.password) {
      if (!validators.validatePassword(req.body.password)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
          timestamp: new Date().toISOString()
        });
      }

      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: ERROR_MESSAGES.OPERATIONS.UPDATE_SUCCESS,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        userType: updatedUser.userType,
        token: generateToken(updatedUser._id)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Google credential is required',
        timestamp: new Date().toISOString()
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check IIIT email domain
    if (!email.endsWith('@iiitdwd.ac.in')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Only IIIT Dharwad emails (@iiitdwd.ac.in) are allowed',
        timestamp: new Date().toISOString()
      });
    }

    // Auto-extract username from email
    const username = email.split('@')[0].toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // New user — auto create account
      user = await User.create({
        email: email.toLowerCase(),
        name: name,
        username: username,
        password: Math.random().toString(36).slice(-16), // random password, never used
        userType: 'student',
        googleId: payload.sub
      });
    }

    // Return user data with token
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Google login successful',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        userType: user.userType,
        adminClubId: user.adminClubId,
        joinedClubs: user.joinedClubs,
        likedPosts: user.likedPosts,
        rsvpEvents: user.rsvpEvents,
        token: generateToken(user._id)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};