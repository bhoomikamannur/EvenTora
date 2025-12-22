const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user (Student signup)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, username, name, userType, adminClubId } = req.body;

    // Validate email domain
    if (!email.endsWith('@iiitdwd.ac.in')) {
      return res.status(400).json({ message: 'Please use your IIIT Dharwad email (@iiitdwd.ac.in)' });
    }

    // Check if user exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username: username.toLowerCase(),
      name,
      userType: userType || 'student',
      adminClubId: userType === 'admin' ? adminClubId : null
    });

    // Return user data with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      userType: user.userType,
      adminClubId: user.adminClubId,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check user type matches
    if (user.userType !== userType) {
      return res.status(401).json({ message: 'Invalid user type' });
    }

    // Return user data with token
    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('joinedClubs');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.username) {
        // Check if new username is already taken
        const existingUser = await User.findOne({ 
          username: req.body.username.toLowerCase(),
          _id: { $ne: req.user._id }
        });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }
        user.username = req.body.username.toLowerCase();
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        userType: updatedUser.userType,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};