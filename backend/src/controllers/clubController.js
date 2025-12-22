const Club = require('../models/Club');
const User = require('../models/User');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
exports.getAllClubs = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const clubs = await Club.find(query).sort({ name: 1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create club
// @route   POST /api/clubs
// @access  Private/Admin
exports.createClub = async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private/Admin
exports.updateClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
exports.joinClub = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Admins cannot join clubs (they can only manage their assigned club)
    if (user.userType === 'admin') {
      return res.status(403).json({ message: 'Admins cannot join communities. You can only manage your assigned club.' });
    }
    
    // Check if already joined
    if (user.joinedClubs.includes(club._id)) {
      return res.status(400).json({ message: 'Already joined this club' });
    }
    
    // Add club to user's joined clubs
    user.joinedClubs.push(club._id);
    await user.save();
    
    // Increment club member count
    club.communityMembers += 1;
    await club.save();

    const updatedUser = await User.findById(user._id).populate('joinedClubs');
    res.json({ message: 'Joined club successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
exports.leaveClub = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check if user is member
    if (!user.joinedClubs.includes(club._id)) {
      return res.status(400).json({ message: 'Not a member of this club' });
    }
    
    // Remove club from user's joined clubs
    user.joinedClubs = user.joinedClubs.filter(
      clubId => clubId.toString() !== club._id.toString()
    );
    await user.save();
    
    // Decrement club member count
    club.communityMembers = Math.max(0, club.communityMembers - 1);
    await club.save();
    
    res.json({ message: 'Left club successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};