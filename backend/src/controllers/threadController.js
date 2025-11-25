const Thread = require('../models/Thread');

// @desc    Get all threads for a club
// @route   GET /api/clubs/:clubId/threads
// @access  Private
exports.getClubThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ clubId: req.params.clubId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create thread
// @route   POST /api/clubs/:clubId/threads
// @access  Private
exports.createThread = async (req, res) => {
  try {
    const { content } = req.body;
    
    const thread = await Thread.create({
      clubId: req.params.clubId,
      author: req.user.name,
      userId: req.user._id,
      content
    });
    
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add reply to thread
// @route   POST /api/threads/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const reply = {
      userId: req.user._id,
      author: req.user.name,
      content: req.body.content
    };
    
    thread.replies.push(reply);
    await thread.save();
    
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete thread
// @route   DELETE /api/threads/:id
// @access  Private
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Check if user is author or admin
    if (thread.userId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this thread' });
    }
    
    await Thread.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};