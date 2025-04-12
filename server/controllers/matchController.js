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

/**
 * 加入比赛 - 第二名用户加入等待中的比赛
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 加入比赛结果
 */
exports.joinMatch = async (req, res) => {
  try {
    // 获取用户ID参数
    const { user2_id } = req.body;
    
    // 参数验证
    if (!user2_id) {
      return res.status(400).json({
        success: false,
        message: '请提供用户ID'
      });
    }
    
    // 查找状态为waiting的比赛（只有一个玩家的比赛）
    const waitingMatch = await Match.findOne({ status: 'waiting' });
    
    // 如果没有等待中的比赛
    if (!waitingMatch) {
      return res.status(404).json({
        success: false,
        message: '无可加入的比赛'
      });
    }
    
    // 确保用户不能加入自己创建的比赛
    if (waitingMatch.user1_id.toString() === user2_id) {
      return res.status(400).json({
        success: false,
        message: '不能加入自己创建的比赛'
      });
    }
    
    // 更新比赛状态为ready并添加第二个玩家
    waitingMatch.user2_id = user2_id;
    waitingMatch.status = 'ready';
    waitingMatch.current_round = 1; // 设置初始回合为1
    
    // 初始化分数
    waitingMatch.user1_score = 0;
    waitingMatch.user2_score = 0;
    
    // 保存更新后的比赛数据
    await waitingMatch.save();
    
    // 返回成功信息
    return res.status(200).json({
      success: true,
      message: '成功加入比赛',
      matchId: waitingMatch._id,
      status: 'ready'
    });
    
  } catch (error) {
    console.error('加入比赛错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 选择策略 - 为对方选择题目难度
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 策略选择结果
 */
exports.chooseStrategy = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { userId, strategy } = req.body;
    
    // 参数验证
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '请提供用户ID'
      });
    }
    
    if (!strategy) {
      return res.status(400).json({
        success: false,
        message: '请提供策略选择'
      });
    }
    
    // 验证策略是否有效
    if (strategy !== 'cooperate' && strategy !== 'betray') {
      return res.status(400).json({
        success: false,
        message: '无效的策略，只能是 cooperate 或 betray'
      });
    }
    
    // 获取比赛信息
    const match = await Match.findById(matchId);
    
    // 如果比赛不存在
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '比赛不存在'
      });
    }
    
    // 确认该用户属于该比赛
    const isUser1 = match.user1_id.toString() === userId;
    const isUser2 = match.user2_id && match.user2_id.toString() === userId;
    
    if (!isUser1 && !isUser2) {
      return res.status(403).json({
        success: false,
        message: '您不是该比赛的参与者'
      });
    }
    
    // 确保比赛状态正确（ready或in_progress）
    if (match.status !== 'ready' && match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `当前比赛状态(${match.status})下不能选择策略`
      });
    }
    
    // 根据用户角色设置策略
    if (isUser1) {
      // 检查是否已设置策略
      if (match.user1_strategy) {
        return res.status(400).json({
          success: false,
          message: '您已经选择过策略'
        });
      }
      match.user1_strategy = strategy;
    } else {
      // 检查是否已设置策略
      if (match.user2_strategy) {
        return res.status(400).json({
          success: false,
          message: '您已经选择过策略'
        });
      }
      match.user2_strategy = strategy;
    }
    
    // 如果双方都已选择策略，更新比赛状态为in_progress
    if (match.user1_strategy && match.user2_strategy && match.status === 'ready') {
      match.status = 'in_progress';
    }
    
    // 保存更新后的比赛数据
    await match.save();
    
    // 返回成功信息
    return res.status(200).json({
      success: true,
      message: '成功选择策略',
      strategy: strategy,
      matchStatus: match.status,
      // 为前端提供更详细的信息，方便展示
      strategyInfo: {
        isUser1: isUser1,
        // 解释选择的策略含义
        difficulty: strategy === 'cooperate' ? '简单' : '困难',
        description: strategy === 'cooperate' ? 
          '您选择了合作策略，将为对方提供简单题目' : 
          '您选择了背叛策略，将为对方提供困难题目'
      }
    });
    
  } catch (error) {
    console.error('选择策略错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 