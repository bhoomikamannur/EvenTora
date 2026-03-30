const Thread = require('../models/Thread');
const User = require('../models/User');
const Club = require('../models/Club');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all threads for a club
// @route   GET /api/clubs/:clubId/threads
// @access  Private
exports.getClubThreads = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log('\n📡 getClubThreads called:');
    console.log('  clubId:', clubId);
    console.log('  userId:', req.user?._id);

    if (!validators.validateObjectId(clubId)) {
      console.error('❌ Invalid clubId:', clubId);
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const club = await Club.findById(clubId);
    if (!club) {
      console.error('❌ Club not found:', clubId);
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }

    console.log('✅ Club found:', club.name);

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Thread.countDocuments({ clubId });
    console.log('📊 Total threads in club:', total);

    const threads = await Thread.find({ clubId })
      .populate('userId', 'name username email')
      .populate('replies.userId', 'name username email')
      .populate('likedBy', '_id')
      .populate('replies.likedBy', '_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    console.log('✅ Fetched threads:', threads.length);
    console.log('📥 Fetched threads with replies:', threads.map(t => ({ 
      id: t._id, 
      username: t.username, 
      content: t.content,
      repliesCount: t.replies?.length || 0,
      likes: t.likes,
      repliesSample: t.replies?.slice(0, 1).map(r => ({ username: r.username, content: r.content }))
    })));
    
    return ApiResponse.paginated(res, threads, total, pageNum, limitNum, 'Threads fetched successfully');
  } catch (error) {
    console.error('❌ Error in getClubThreads:', error.message);
    next(error);
  }
};

// @desc    Get reported threads (Admin only)
// @route   GET /api/clubs/:clubId/threads/reported
// @access  Private/Admin
exports.getReportedThreads = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    if (!validators.validateObjectId(clubId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.CLUB_NOT_FOUND);
    }

    const threads = await Thread.find({ 
      clubId,
      isReported: true 
    })
      .populate('userId', 'name username email')
      .populate('replies.userId', 'name username email')
      .populate('likedBy', '_id')
      .populate('replies.likedBy', '_id')
      .sort({ createdAt: -1 })
      .lean();
    
    return ApiResponse.success(res, threads, 'Reported threads fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create thread
// @route   POST /api/clubs/:clubId/threads
// @access  Private
exports.createThread = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { content } = req.body;

    // Validate required fields
    if (!clubId || !content) {
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

    // Validate content
    if (content.trim().length < 1 || content.trim().length > 5000) {
      return ApiResponse.badRequest(res, 'Thread content must be between 1 and 5000 characters');
    }

    const thread = await Thread.create({
      clubId,
      author: req.user.name,
      username: req.user.username,
      userId: req.user._id,
      content: validators.sanitizeInput(content.trim())
    });
    
    const populatedThread = await Thread.findById(thread._id)
      .populate('userId', 'name username email')
      .populate('likedBy', '_id')
      .populate('replies.userId', 'name username email');
    
    console.log('✅ Thread created:', {
      id: populatedThread._id,
      author: populatedThread.author,
      username: populatedThread.username,
      content: populatedThread.content.substring(0, 50)
    });
    
    return ApiResponse.created(res, populatedThread, ERROR_MESSAGES.OPERATIONS.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike thread
// @route   POST /api/threads/:id/like
// @access  Private
exports.likeThread = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const thread = await Thread.findById(id);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
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

    // Return full thread with populated data for UI consistency
    const updatedThread = await Thread.findById(thread._id)
      .populate('userId', 'username name')
      .populate('likedBy', 'username name')
      .populate('replies.userId', 'username name')
      .populate('replies.likedBy', 'username name');
    
    return ApiResponse.success(res, 
      { 
        thread: updatedThread,
        likes: updatedThread.likes, 
        isLiked: !isLiked,
        likedCount: updatedThread.likes
      },
      isLiked ? 'Thread unliked successfully' : 'Thread liked successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to thread
// @route   POST /api/threads/:id/reply
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return ApiResponse.badRequest(res, 'Reply content is required');
    }

    if (content.trim().length > 5000) {
      return ApiResponse.badRequest(res, 'Reply content must be less than 5000 characters');
    }
    
    const thread = await Thread.findById(id);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    const reply = {
      userId: req.user._id,
      author: req.user.name,
      username: req.user.username,
      content: validators.sanitizeInput(content.trim())
    };
    
    thread.replies.push(reply);
    await thread.save();
    
    const populatedThread = await Thread.findById(thread._id)
      .populate('userId', 'name username email')
      .populate('replies.userId', 'name username email')
      .populate('likedBy', '_id')
      .populate('replies.likedBy', '_id');
    
    console.log('✅ Reply added:', {
      threadId: thread._id,
      repliesCount: populatedThread.replies.length,
      latestReply: populatedThread.replies[populatedThread.replies.length - 1]
    });
    
    return ApiResponse.success(res, populatedThread, 'Reply added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike reply
// @route   POST /api/threads/:threadId/reply/:replyId/like
// @access  Private
exports.likeReply = async (req, res, next) => {
  try {
    const { threadId, replyId } = req.params;

    if (!validators.validateObjectId(threadId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(replyId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const thread = await Thread.findById(threadId);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    const reply = thread.replies.id(replyId);
    
    if (!reply) {
      return ApiResponse.notFound(res, 'Reply not found');
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
    
    // Return full thread with populated data for UI consistency
    const updatedThread = await Thread.findById(threadId)
      .populate('userId', 'username name')
      .populate('likedBy', 'username name')
      .populate('replies.userId', 'username name')
      .populate('replies.likedBy', 'username name');
    
    return ApiResponse.success(res,
      { 
        thread: updatedThread,
        likes: reply.likes, 
        isLiked: !isLiked,
        likedCount: reply.likes
      },
      isLiked ? 'Reply unliked successfully' : 'Reply liked successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Report thread
// @route   POST /api/threads/:id/report
// @access  Private
exports.reportThread = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!reason || reason.trim().length === 0) {
      return ApiResponse.badRequest(res, 'Report reason is required');
    }

    if (reason.trim().length > 500) {
      return ApiResponse.badRequest(res, 'Report reason must be less than 500 characters');
    }
    
    const thread = await Thread.findById(id);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    // Check if user already reported
    const alreadyReported = thread.reports.some(
      r => r.userId.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return ApiResponse.badRequest(res, 'You have already reported this thread');
    }
    
    // Add report
    thread.reports.push({
      userId: req.user._id,
      userName: req.user.name,
      reason: validators.sanitizeInput(reason.trim())
    });
    
    thread.isReported = true;
    await thread.save();
    
    return ApiResponse.success(res,
      { reportCount: thread.reports.length },
      'Thread reported successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Report reply
// @route   POST /api/threads/:threadId/reply/:replyId/report
// @access  Private
exports.reportReply = async (req, res, next) => {
  try {
    const { threadId, replyId } = req.params;
    const { reason } = req.body;

    if (!validators.validateObjectId(threadId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(replyId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!reason || reason.trim().length === 0) {
      return ApiResponse.badRequest(res, 'Report reason is required');
    }

    if (reason.trim().length > 500) {
      return ApiResponse.badRequest(res, 'Report reason must be less than 500 characters');
    }
    
    const thread = await Thread.findById(threadId);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    const reply = thread.replies.id(replyId);
    
    if (!reply) {
      return ApiResponse.notFound(res, 'Reply not found');
    }
    
    // Check if user already reported
    const alreadyReported = reply.reports.some(
      r => r.userId.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return ApiResponse.badRequest(res, 'You have already reported this reply');
    }
    
    // Add report
    reply.reports.push({
      userId: req.user._id,
      userName: req.user.name,
      reason: validators.sanitizeInput(reason.trim())
    });
    
    reply.isReported = true;
    await thread.save();
    
    return ApiResponse.success(res,
      { reportCount: reply.reports.length },
      'Reply reported successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete thread
// @route   DELETE /api/threads/:id
// @access  Private (Author or Admin)
exports.deleteThread = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const thread = await Thread.findById(id);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    // Check if user is author or admin
    const isAuthor = thread.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return ApiResponse.forbidden(res, ERROR_MESSAGES.AUTH.NOT_AUTHORIZED_DELETE);
    }
    
    await Thread.findByIdAndDelete(id);
    
    return ApiResponse.success(res,
      { deletedBy: isAdmin ? 'admin' : 'author' },
      'Thread deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reply
// @route   DELETE /api/threads/:threadId/reply/:replyId
// @access  Private (Author or Admin)
exports.deleteReply = async (req, res, next) => {
  try {
    const { threadId, replyId } = req.params;

    if (!validators.validateObjectId(threadId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!validators.validateObjectId(replyId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const thread = await Thread.findById(threadId);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    const reply = thread.replies.id(replyId);
    
    if (!reply) {
      return ApiResponse.notFound(res, 'Reply not found');
    }
    
    // Check if user is author or admin
    const isAuthor = reply.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return ApiResponse.forbidden(res, ERROR_MESSAGES.AUTH.NOT_AUTHORIZED_DELETE);
    }
    
    reply.deleteOne();
    await thread.save();
    
    return ApiResponse.success(res,
      { deletedBy: isAdmin ? 'admin' : 'author' },
      'Reply deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss report (Admin only)
// @route   POST /api/threads/:id/dismiss-report
// @access  Private/Admin
exports.dismissReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const thread = await Thread.findById(id);
    
    if (!thread) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.THREAD_NOT_FOUND);
    }
    
    thread.reports = [];
    thread.isReported = false;
    await thread.save();
    
    return ApiResponse.success(res, {}, 'Report dismissed successfully');
  } catch (error) {
    next(error);
  }
};