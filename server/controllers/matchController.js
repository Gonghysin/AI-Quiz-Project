const Match = require('../models/matchModel');
const User = require('../models/User');

/**
 * 匹配队列 - 存储等待匹配的用户
 * 结构: { userId: { userId, targetId, timestamp } }
 */
const matchQueue = {};

/**
 * 活跃匹配 - 存储已匹配成功的用户对
 * 结构: { matchId: { player1, player2, startTime } }
 */
const activeMatches = {};

/**
 * 请求匹配比赛
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 匹配请求结果
 */
exports.requestMatch = async (req, res) => {
  try {
    const userId = req.user;
    const { targetId } = req.body; // 对手的2050 ID

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: '请提供对手的2050 ID'
      });
    }

    // 检查对手是否存在
    const targetUser = await User.findOne({ userId: targetId });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '对手不存在'
      });
    }

    // 不能与自己匹配
    if (userId === targetId) {
      return res.status(400).json({
        success: false,
        message: '不能与自己匹配'
      });
    }
    
    // 检查用户是否已在匹配队列中
    if (matchQueue[userId]) {
      return res.status(400).json({
        success: false,
        message: '您已在匹配队列中'
      });
    }
    
    // 检查用户是否已在活跃比赛中
    const isInActiveMatch = Object.values(activeMatches).some(
      match => match.player1 === userId || match.player2 === userId
    );
    
    if (isInActiveMatch) {
      return res.status(400).json({
        success: false,
        message: '您已在比赛中'
      });
    }

    // 检查对手是否已在匹配队列中等待与当前用户匹配
    if (matchQueue[targetId] && matchQueue[targetId].targetId === userId) {
      // 双方都请求匹配对方，可以开始比赛
      const matchId = Date.now().toString();
      
      // 从队列中移除这两名玩家
      delete matchQueue[userId];
      delete matchQueue[targetId];
      
      // 添加到活跃匹配中
      activeMatches[matchId] = {
        matchId,
        player1: userId,
        player2: targetId,
        startTime: Date.now()
      };
      
      return res.status(200).json({
        success: true,
        message: '匹配成功',
        match: {
          matchId,
          opponent: targetId,
          startTime: Date.now()
        }
      });
    }
    
    // 将用户添加到匹配队列
    matchQueue[userId] = {
      userId,
      targetId,
      timestamp: Date.now()
    };
    
    // 等待对手接受匹配
    return res.status(200).json({
      success: true,
      message: '已发送匹配请求，等待对手接受',
      targetId
    });
    
  } catch (error) {
    console.error('匹配请求错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 取消匹配请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 取消匹配结果
 */
exports.cancelMatch = async (req, res) => {
  try {
    const userId = req.user;
    
    // 检查用户是否在匹配队列中
    if (!matchQueue[userId]) {
      return res.status(400).json({
        success: false,
        message: '您不在匹配队列中'
      });
    }
    
    // 从匹配队列中移除用户
    delete matchQueue[userId];
    
    return res.status(200).json({
      success: true,
      message: '已取消匹配请求'
    });
    
  } catch (error) {
    console.error('取消匹配错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取当前匹配状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 当前匹配状态
 */
exports.getMatchStatus = async (req, res) => {
  try {
    const userId = req.user;
    
    // 检查是否在匹配队列中
    if (matchQueue[userId]) {
      return res.status(200).json({
        success: true,
        status: 'waiting',
        targetId: matchQueue[userId].targetId,
        queueTime: Date.now() - matchQueue[userId].timestamp
      });
    }
    
    // 检查是否在活跃比赛中
    const activeMatch = Object.values(activeMatches).find(
      match => match.player1 === userId || match.player2 === userId
    );
    
    if (activeMatch) {
      const opponent = activeMatch.player1 === userId 
        ? activeMatch.player2 
        : activeMatch.player1;
        
      return res.status(200).json({
        success: true,
        status: 'matched',
        match: {
          matchId: activeMatch.matchId,
          opponent,
          startTime: activeMatch.startTime,
          duration: Date.now() - activeMatch.startTime
        }
      });
    }
    
    // 既不在队列中也不在比赛中
    return res.status(200).json({
      success: true,
      status: 'idle',
      message: '当前未参与匹配或比赛'
    });
    
  } catch (error) {
    console.error('获取匹配状态错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 