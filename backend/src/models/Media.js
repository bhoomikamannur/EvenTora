const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Media title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['youtube', 'instagram', 'github', 'other'],
    required: true
  },
  link: {
    type: String,
    required: [true, 'Media link is required'],
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for timestamp display
mediaSchema.virtual('timestamp').get(function() {
  const now = new Date();
  const diff = Math.floor((now - this.createdAt) / 1000 / 86400); // days
  
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return this.createdAt.toLocaleDateString();
});

mediaSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Media', mediaSchema);