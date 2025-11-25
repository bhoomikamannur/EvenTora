const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    required: true,
    default: '🎯'
  },
  color: {
    type: String,
    required: true,
    default: '#ab83c3'
  },
  type: {
    type: String,
    enum: ['technical', 'cultural'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  members: {
    type: Number,
    default: 0
  },
  communityMembers: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Club', clubSchema);