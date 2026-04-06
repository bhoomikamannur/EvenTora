const Post = require('../models/Post');
const User = require('../models/User');
const Club = require('../models/Club');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
  try {
    const { clubId, page = 1, limit = 10 } = req.query;
    
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

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('clubId', 'name logo color')
      .populate('authorId', 'username email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    return ApiResponse.paginated(res, posts, total, pageNum, limitNum, 'Posts fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const post = await Post.findById(id)
      .populate('clubId', 'name logo color')
      .populate('authorId', 'username email name');
    
    if (!post) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.POST_NOT_FOUND);
    }
    
    return ApiResponse.success(res, post, 'Post fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { clubId, eventTitle, caption, images } = req.body;
    
    // Validate required fields
    if (!clubId || !eventTitle || !caption) {
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

    // Validate field lengths
    if (eventTitle.trim().length < 2 || eventTitle.trim().length > 200) {
      return ApiResponse.badRequest(res, 'Event title must be between 2 and 200 characters');
    }

    if (caption.trim().length < 1 || caption.trim().length > 5000) {
      return ApiResponse.badRequest(res, 'Caption must be between 1 and 5000 characters');
    }

    // Validate images array if provided
    if (images && Array.isArray(images)) {
      for (let img of images) {
        if (!validators.validateUrl(img)) {
          return ApiResponse.badRequest(res, 'Invalid image URL format');
        }
      }
    }

    const post = await Post.create({
      clubId,
      eventTitle: eventTitle.trim(),
      caption: validators.sanitizeInput(caption),
      images: images || [],
      author: club.name,
      authorId: req.user._id
    });

    const populatedPost = await Post.findById(post._id)
      .populate('clubId', 'name logo color')
      .populate('authorId', 'username email name');
    
    return ApiResponse.created(res, populatedPost, ERROR_MESSAGES.OPERATIONS.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.POST_NOT_FOUND);
    }

    // Check authorization
    const postAuthorId = post.authorId.toString();
    const currentUserId = req.user._id.toString();
    
    if (postAuthorId !== currentUserId && req.user.userType !== 'admin') {
      return ApiResponse.forbidden(res, ERROR_MESSAGES.AUTH.NOT_AUTHORIZED_UPDATE);
    }

    // Validate fields if provided
    if (req.body.eventTitle && (req.body.eventTitle.trim().length < 2 || req.body.eventTitle.trim().length > 200)) {
      return ApiResponse.badRequest(res, 'Event title must be between 2 and 200 characters');
    }

    if (req.body.caption && (req.body.caption.trim().length < 1 || req.body.caption.trim().length > 5000)) {
      return ApiResponse.badRequest(res, 'Caption must be between 1 and 5000 characters');
    }

    if (req.body.images && Array.isArray(req.body.images)) {
      for (let img of req.body.images) {
        if (!validators.validateUrl(img)) {
          return ApiResponse.badRequest(res, 'Invalid image URL format');
        }
      }
    }

    // Sanitize inputs
    if (req.body.caption) {
      req.body.caption = validators.sanitizeInput(req.body.caption);
    }
    if (req.body.eventTitle) {
      req.body.eventTitle = req.body.eventTitle.trim();
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clubId', 'name logo color')
      .populate('authorId', 'username email name');
    
    return ApiResponse.success(res, updatedPost, ERROR_MESSAGES.OPERATIONS.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.POST_NOT_FOUND);
    }

    // Check authorization
    const postAuthorId = post.authorId.toString();
    const currentUserId = req.user._id.toString();
    
    if (postAuthorId !== currentUserId && req.user.userType !== 'admin') {
      return ApiResponse.forbidden(res, ERROR_MESSAGES.AUTH.NOT_AUTHORIZED_DELETE);
    }

    await Post.findByIdAndDelete(id);
    
    return ApiResponse.success(res, {}, ERROR_MESSAGES.OPERATIONS.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const post = await Post.findById(id);
    const user = await User.findById(req.user._id);
    
    if (!post) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.POST_NOT_FOUND);
    }
    
    const userIdString = req.user._id.toString();
    const isLiked = post.likedBy.some(id => id.toString() === userIdString);
    
    if (isLiked) {
      // Unlike
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(id => id.toString() !== userIdString);
      user.likedPosts = user.likedPosts.filter(id => id.toString() !== post._id.toString());
    } else {
      // Like
      post.likes += 1;
      post.likedBy.push(req.user._id);
      user.likedPosts.push(post._id);
    }
    
    await post.save();
    await user.save();
    
    // Return full post with populated data for UI consistency
    const updatedPost = await Post.findById(post._id)
      .populate('clubId', 'name logo color')
      .populate('authorId', 'username email name')
      .populate('likedBy', 'username name');
    
    return ApiResponse.success(res, 
      { 
        post: updatedPost,
        likes: updatedPost.likes, 
        isLiked: !isLiked,
        likedCount: updatedPost.likes
      }, 
      isLiked ? 'Post unliked successfully' : 'Post liked successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!validators.validateObjectId(id)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    if (!text || text.trim().length === 0) {
      return ApiResponse.badRequest(res, 'Comment text is required');
    }

    if (text.trim().length > 1000) {
      return ApiResponse.badRequest(res, 'Comment must be less than 1000 characters');
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.POST_NOT_FOUND);
    }
    
    const comment = {
      userId: req.user._id,
      username: req.user.name,
      text: validators.sanitizeInput(text)
    };
    
    post.comments.push(comment);
    await post.save();
    
    const updatedPost = await Post.findById(id)
      .populate('clubId', 'name logo color')
      .populate('authorId', 'username email name');
    
    return ApiResponse.success(res, updatedPost, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:postId/comment/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    if (!validators.validateObjectId(postId)) {
      return ApiResponse.badRequest(res, ERROR_MESSAGES.VALIDATION.INVALID_OBJECT_ID);
    }

    const post = await Post.findById(postId);

    if (!post) {
      return ApiResponse.notFound(res, ERROR_MESSAGES.RESOURCES.POST_NOT_FOUND);
    }

    // 🔥 THIS IS THE IMPORTANT FIX
    post.comments = post.comments.filter(
      c => c._id.toString() !== commentId
    );

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('clubId', 'name logo color')
      .populate('authorId', 'username email name');

    return ApiResponse.success(res, updatedPost, 'Comment deleted successfully');

  } catch (error) {
    next(error);
  }
};