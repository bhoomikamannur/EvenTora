const Post = require('../models/Post');
const User = require('../models/User');
const Club = require('../models/Club');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const { clubId } = req.query;
    
    let query = {};
    if (clubId) {
      query.clubId = clubId;
    }

    const posts = await Post.find(query)
      .populate('clubId', 'name logo color')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('clubId', 'name logo color');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { clubId, eventTitle, caption, images } = req.body;
    
    // Get club info for author name
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const post = await Post.create({
      clubId,
      eventTitle,
      caption,
      images: images || [],
      author: club.name,
      authorId: req.user._id
    });

    const populatedPost = await Post.findById(post._id)
      .populate('clubId', 'name logo color');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized
    if (post.authorId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clubId', 'name logo color');
    
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized
    if (post.authorId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user._id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
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
    
    res.json({ 
      message: isLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = {
      userId: req.user._id,
      username: req.user.name,
      text: req.body.text
    };
    
    post.comments.push(comment);
    await post.save();
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};