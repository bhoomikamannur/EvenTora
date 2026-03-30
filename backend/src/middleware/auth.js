const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.userType === 'admin' || req.user.userType === 'organizer')
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

exports.organizerOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'organizer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as organizer' });
  }
};