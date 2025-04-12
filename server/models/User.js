const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  questionsCompleted: {
    type: Number,
    default: 0
  },
  rewardsClaimed: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 