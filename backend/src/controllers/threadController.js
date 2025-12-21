const Thread = require('../models/Thread');
const User = require('../models/User');

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

// @desc    Get reported threads (Admin only)
// @route   GET /api/clubs/:clubId/threads/reported
// @access  Private/Admin
exports.getReportedThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ 
      clubId: req.params.clubId,
      isReported: true 
    })
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
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Thread content is required' });
    }
    
    const thread = await Thread.create({
      clubId: req.params.clubId,
      author: req.user.name,
      userId: req.user._id,
      content: content.trim()
    });
    
    const populatedThread = await Thread.findById(thread._id)
      .populate('userId', 'name');
    
    res.status(201).json(populatedThread);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Like/Unlike thread
// @route   POST /api/threads/:id/like
// @access  Private
exports.likeThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const userIdString = req.user._id.toString();
    const isLiked = thread.likedBy.some(id => id.toString() === userIdString);
    
    if (isLiked) {
      // Unlike
      thread.likes = Math.max(0, thread.likes - 1);
      thread.likedBy = thread.likedBy.filter(id => id.toString() !== userIdString);
    } else {
      // Like
      thread.likes += 1;
      thread.likedBy.push(req.user._id);
    }
    
    await thread.save();
    
    res.json({ 
      message: isLiked ? 'Thread unliked' : 'Thread liked',
      likes: thread.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reply to thread
// @route   POST /api/threads/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const reply = {
      userId: req.user._id,
      author: req.user.name,
      content: content.trim()
    };
    
    thread.replies.push(reply);
    await thread.save();
    
    const populatedThread = await Thread.findById(thread._id)
      .populate('userId', 'name');
    
    res.status(201).json(populatedThread);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Like/Unlike reply
// @route   POST /api/threads/:threadId/reply/:replyId/like
// @access  Private
exports.likeReply = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const reply = thread.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    const userIdString = req.user._id.toString();
    const isLiked = reply.likedBy.some(id => id.toString() === userIdString);
    
    if (isLiked) {
      // Unlike
      reply.likes = Math.max(0, reply.likes - 1);
      reply.likedBy = reply.likedBy.filter(id => id.toString() !== userIdString);
    } else {
      // Like
      reply.likes += 1;
      reply.likedBy.push(req.user._id);
    }
    
    await thread.save();
    
    res.json({ 
      message: isLiked ? 'Reply unliked' : 'Reply liked',
      likes: reply.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report thread
// @route   POST /api/threads/:id/report
// @access  Private
exports.reportThread = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Check if user already reported
    const alreadyReported = thread.reports.some(
      r => r.userId.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this thread' });
    }
    
    // Add report
    thread.reports.push({
      userId: req.user._id,
      userName: req.user.name,
      reason: reason.trim()
    });
    
    thread.isReported = true;
    await thread.save();
    
    res.json({ 
      message: 'Thread reported successfully',
      reportCount: thread.reports.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report reply
// @route   POST /api/threads/:threadId/reply/:replyId/report
// @access  Private
exports.reportReply = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const thread = await Thread.findById(req.params.threadId);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const reply = thread.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user already reported
    const alreadyReported = reply.reports.some(
      r => r.userId.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this reply' });
    }
    
    // Add report
    reply.reports.push({
      userId: req.user._id,
      userName: req.user.name,
      reason: reason.trim()
    });
    
    reply.isReported = true;
    await thread.save();
    
    res.json({ 
      message: 'Reply reported successfully',
      reportCount: reply.reports.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete thread
// @route   DELETE /api/threads/:id
// @access  Private (Author or Admin)
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Check if user is author or admin
    const isAuthor = thread.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this thread' });
    }
    
    await Thread.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Thread deleted successfully',
      deletedBy: isAdmin ? 'admin' : 'author'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reply
// @route   DELETE /api/threads/:threadId/reply/:replyId
// @access  Private (Author or Admin)
exports.deleteReply = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const reply = thread.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user is author or admin
    const isAuthor = reply.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }
    
    reply.deleteOne();
    await thread.save();
    
    res.json({ 
      message: 'Reply deleted successfully',
      deletedBy: isAdmin ? 'admin' : 'author'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dismiss report (Admin only)
// @route   POST /api/threads/:id/dismiss-report
// @access  Private/Admin
exports.dismissReport = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    thread.reports = [];
    thread.isReported = false;
    await thread.save();
    
    res.json({ message: 'Report dismissed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};