const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  eventTitle: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    trim: true
  },
  images: [{
    type: String
  }],
  author: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for timestamp display
postSchema.virtual('timestamp').get(function() {
  const now = new Date();
  const diff = Math.floor((now - this.createdAt) / 1000); // seconds
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return this.createdAt.toLocaleDateString();
});

postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);