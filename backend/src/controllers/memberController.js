const Member = require('../models/Member');
const Club = require('../models/Club');

// @desc    Get all members of a club
// @route   GET /api/clubs/:clubId/members
// @access  Public
exports.getClubMembers = async (req, res) => {
  try {
    const members = await Member.find({ clubId: req.params.clubId })
      .sort({ position: 1, name: 1 });
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to club
// @route   POST /api/clubs/:clubId/members
// @access  Private/Admin
exports.addMember = async (req, res) => {
  try {
    const { name, position, email } = req.body;
    
    const member = await Member.create({
      clubId: req.params.clubId,
      name,
      position: position || 'Member',
      email
    });
    
    // Increment club member count
    await Club.findByIdAndUpdate(req.params.clubId, {
      $inc: { members: 1 }
    });
    
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/clubs/:clubId/members/:id
// @access  Private/Admin
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      _id: req.params.id,
      clubId: req.params.clubId
    });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/clubs/:clubId/members/:id
// @access  Private/Admin
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({
      _id: req.params.id,
      clubId: req.params.clubId
    });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Decrement club member count
    await Club.findByIdAndUpdate(req.params.clubId, {
      $inc: { members: -1 }
    });
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};