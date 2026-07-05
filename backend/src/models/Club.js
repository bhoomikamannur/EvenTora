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
  // Snapshot log used to plot member growth over time on the admin
  // analytics dashboard. A new entry is pushed whenever someone joins
  // or leaves this club.
  memberHistory: {
    type: [{
      count: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Club', clubSchema);