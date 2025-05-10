const mongoose = require('mongoose');

/**
 * 题目模型
 * 用于存储所有比赛题目
 */
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: '选项必须是非空数组'
    }
  },
  answer: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: '答案必须是非空数组'
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'hard'],
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'multiple', 'boolean'],
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// 创建索引以提高查询效率
questionSchema.index({ difficulty: 1, type: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question; 