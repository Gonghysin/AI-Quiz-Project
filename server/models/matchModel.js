const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 比赛模型
 */
const MatchSchema = new Schema({
  // 玩家信息
  user1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 策略选择
  user1_strategy: {
    type: String,
    enum: ['cooperate', 'betray']
  },
  user2_strategy: {
    type: String,
    enum: ['cooperate', 'betray']
  },
  
  // 题目
  user1_questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  user2_questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  
  // 答案
  user1_answers: [String],
  user2_answers: [String],
  
  // 得分
  user1_score: {
    type: Number,
    default: 0
  },
  user2_score: {
    type: Number,
    default: 0
  },
  
  // 回合信息
  current_round: {
    type: Number,
    default: 1,
    min: 1,
    max: 2
  },
  
  // 比赛状态
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in_progress', 'finished'],
    default: 'waiting'
  },
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema); 