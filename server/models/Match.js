const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 比赛模型
 * 用于存储两名玩家之间的比赛信息
 * 包含玩家信息、策略选择、题目、答案、得分等
 */
const matchSchema = new Schema({
  // 玩家信息
  user1_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // 玩家策略选择 (cooperate=简单题, betray=难题)
  user1_strategy: {
    type: String,
    enum: ['cooperate', 'betray'],
    default: null
  },
  user2_strategy: {
    type: String,
    enum: ['cooperate', 'betray'],
    default: null
  },
  
  // 玩家题目 (每轮两题，共两轮)
  user1_questions: [{
    type: Schema.Types.Mixed // 存储题目对象
  }],
  user2_questions: [{
    type: Schema.Types.Mixed // 存储题目对象
  }],
  
  // 玩家答案
  user1_answers: [{
    type: String
  }],
  user2_answers: [{
    type: String
  }],
  
  // 玩家得分
  user1_score: {
    type: Number,
    default: 0
  },
  user2_score: {
    type: Number,
    default: 0
  },
  
  // 当前回合 (1或2)
  current_round: {
    type: Number,
    default: 1
  },
  
  // 比赛状态
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in_progress', 'finished'],
    default: 'waiting'
  }
}, { timestamps: true }); // 添加创建时间和更新时间字段

const Match = mongoose.model('Match', matchSchema);
module.exports = Match; 