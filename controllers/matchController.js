const Match = require('../models/Match');

/**
 * 创建新比赛
 * @route POST /api/match
 * @param {string} req.body.user1_id - 创建者的用户ID
 * @returns {Object} 返回比赛ID和状态
 */
const createMatch = async (req, res) => {
  try {
    // 从请求体中获取user1_id（比赛创建者ID）
    const { user1_id } = req.body;
    
    // 验证user1_id是否存在
    if (!user1_id) {
      return res.status(400).json({ 
        success: false, 
        message: '创建比赛需要提供用户ID' 
      });
    }
    
    // 创建新的比赛实例
    const newMatch = new Match({
      user1_id,              // 设置创建者ID
      user2_id: null,        // 初始时对手为空
      user1_strategy: null,  // 初始时策略为空
      user2_strategy: null,  // 初始时策略为空
      user1_questions: [],   // 初始时题目为空数组
      user2_questions: [],   // 初始时题目为空数组
      user1_answers: [],     // 初始时答案为空数组
      user2_answers: [],     // 初始时答案为空数组
      user1_score: 0,        // 初始时分数为0
      user2_score: 0,        // 初始时分数为0
      current_round: 1,      // 设置当前回合为第1回合
      status: 'waiting'      // 设置初始状态为等待中
    });
    
    // 保存比赛到数据库
    await newMatch.save();
    
    // 返回成功响应，包含比赛ID和状态
    return res.status(201).json({
      success: true,
      message: '比赛创建成功',
      matchId: newMatch._id,
      status: newMatch.status
    });
    
  } catch (error) {
    // 捕获并处理错误
    console.error('创建比赛失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，创建比赛失败',
      error: error.message
    });
  }
};

module.exports = {
  createMatch
}; 