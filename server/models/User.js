const mongoose = require('mongoose');

// 定义用户模式
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // 确保用户ID唯一
    trim: true
  },
  nickname: {
    type: String,
    required: true,
    unique: true, // 确保昵称唯一
    trim: true
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
}, { timestamps: true }); // 添加创建时间和更新时间

// 创建并导出用户模型
const User = mongoose.model('User', userSchema);
module.exports = User; 