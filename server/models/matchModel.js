const mongoose = require('mongoose');

/**
 * 比赛匹配模型
 * 用于存储用户之间的比赛匹配信息
 */
const matchSchema = new mongoose.Schema({
  // 比赛ID
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  
  // 玩家1
  player1: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // 玩家2
  player2: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // 比赛开始时间
  startTime: {
    type: Date,
    default: Date.now
  },
  
  // 比赛结束时间（如果有）
  endTime: {
    type: Date
  },
  
  // 比赛状态: 'ongoing', 'completed', 'canceled'
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'canceled'],
    default: 'ongoing'
  },
  
  // 比赛结果: player1 或 player2 的 ID，或 null 表示平局
  winner: {
    type: String,
    ref: 'User'
  },
  
  // 玩家1的分数
  player1Score: {
    type: Number,
    default: 0
  },
  
  // 玩家2的分数
  player2Score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 创建索引以提高查询效率
matchSchema.index({ player1: 1, status: 1 });
matchSchema.index({ player2: 1, status: 1 });
matchSchema.index({ startTime: -1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match; 