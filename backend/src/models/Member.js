const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  position: {
    type: String,
    enum: ['Lead', 'Co-Lead', 'Team Lead', 'Member'],
    default: 'Member'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', memberSchema);