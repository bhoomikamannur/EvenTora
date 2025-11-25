const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  author: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Thread content is required'],
    trim: true
  },
  replies: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    author: String,
    content: String,
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
threadSchema.virtual('timestamp').get(function() {
  const now = new Date();
  const diff = Math.floor((now - this.createdAt) / 1000 / 3600); // hours
  
  if (diff === 0) return 'Just now';
  if (diff < 24) return `${diff}h ago`;
  return `${Math.floor(diff / 24)}d ago`;
});

threadSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Thread', threadSchema);