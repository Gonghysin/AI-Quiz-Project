const Match = require('../models/Match');
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
 * 创建新比赛
 * @route POST /api/match
 * @param {string} req.body.user1_id - 创建者的用户ID
 * @returns {Object} 返回比赛ID和状态
 */
exports.createMatch = async (req, res) => {
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

/**
 * 加入比赛
 * @route POST /api/match/join
 * @param {string} req.body.user2_id - 第二名玩家的用户ID
 * @returns {Object} 返回比赛ID和状态
 */
exports.joinMatch = async (req, res) => {
  try {
    const { user2_id } = req.body;
    
    // 验证user2_id是否存在
    if (!user2_id) {
      return res.status(400).json({ 
        success: false, 
        message: '加入比赛需要提供用户ID' 
      });
    }
    
    // 查找一个状态为"waiting"的比赛
    const match = await Match.findOne({ status: 'waiting' });
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '当前没有等待中的比赛'
      });
    }
    
    // 更新比赛对象，添加第二位玩家并改变状态
    match.user2_id = user2_id;
    match.status = 'ready';
    
    // 保存更新后的比赛
    await match.save();
    
    return res.status(200).json({
      success: true,
      message: '成功加入比赛',
      matchId: match._id,
      status: match.status
    });
    
  } catch (error) {
    console.error('加入比赛失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，加入比赛失败',
      error: error.message
    });
  }
};

/**
 * 选择策略（给对方选难度）
 * @route POST /api/match/:id/choose-strategy
 * @param {string} req.params.id - 比赛ID
 * @param {string} req.body.userId - 玩家ID
 * @param {string} req.body.strategy - 策略选择（'cooperate'或'betray'）
 * @returns {Object} 返回确认状态
 */
exports.chooseStrategy = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, strategy } = req.body;
    
    // 基本验证
    if (!id || !userId || !strategy) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 验证策略是否有效
    if (strategy !== 'cooperate' && strategy !== 'betray') {
      return res.status(400).json({
        success: false,
        message: '无效的策略选择'
      });
    }
    
    // 查找比赛
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '比赛不存在'
      });
    }
    
    // 确定是哪位玩家并更新对应的策略
    if (userId == match.user1_id) {
      match.user1_strategy = strategy;
    } else if (userId == match.user2_id) {
      match.user2_strategy = strategy;
    } else {
      return res.status(403).json({
        success: false,
        message: '您不是该比赛的参与者'
      });
    }
    
    // 如果两位玩家都选择了策略，比赛状态改为进行中
    if (match.user1_strategy && match.user2_strategy) {
      match.status = 'in_progress';
    }
    
    // 保存更新后的比赛
    await match.save();
    
    return res.status(200).json({
      success: true,
      message: '策略选择成功',
      matchStatus: match.status
    });
    
  } catch (error) {
    console.error('选择策略失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，选择策略失败',
      error: error.message
    });
  }
};

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
 * 获取比赛题目
 * @route GET /api/match/:id/questions
 * @param {string} req.params.id - 比赛ID
 * @param {string} req.query.user - 用户ID
 * @returns {Object} 返回题目
 */
exports.getQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.user;
    
    if (!id || !userId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 查找比赛
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '比赛不存在'
      });
    }
    
    // 确认用户是比赛参与者
    if (userId != match.user1_id && userId != match.user2_id) {
      return res.status(403).json({
        success: false, 
        message: '您不是该比赛的参与者'
      });
    }
    
    // 确保比赛状态为进行中
    if (match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `比赛当前状态为 ${match.status}，无法获取题目`
      });
    }
    
    // 确定对手
    const isUser1 = userId == match.user1_id;
    const opponentStrategy = isUser1 ? match.user2_strategy : match.user1_strategy;
    
    // 确定题目难度
    const difficulty = opponentStrategy === 'cooperate' ? 'easy' : 'hard';
    
    // TODO: 从题库中抽取50道指定难度的题目
    // 这里先模拟50道题
    const questions = Array(50).fill().map((_, i) => ({
      id: `q${i}`,
      questionText: `${difficulty}难度的问题${i+1}`,
      options: ['A', 'B', 'C', 'D'],
      type: 'single'
    }));
    
    return res.status(200).json({
      success: true,
      questions,
      currentRound: match.current_round
    });
    
  } catch (error) {
    console.error('获取题目失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，获取题目失败',
      error: error.message
    });
  }
};

/**
 * 提交答题结果
 * @route POST /api/match/:id/submit
 * @param {string} req.params.id - 比赛ID
 * @param {string} req.body.userId - 用户ID
 * @param {Array} req.body.answers - 答案数组
 * @returns {Object} 返回提交状态
 */
exports.submitAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, answers } = req.body;
    
    // 基本验证
    if (!id || !userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数或格式不正确'
      });
    }
    
    // 查找比赛
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({
        success: false, 
        message: '比赛不存在'
      });
    }
    
    // 确定是哪位玩家
    const isUser1 = userId == match.user1_id;
    
    if (!isUser1 && userId != match.user2_id) {
      return res.status(403).json({
        success: false,
        message: '您不是该比赛的参与者'
      });
    }
    
    // 更新玩家答案
    if (isUser1) {
      match.user1_answers = match.user1_answers.concat(answers);
    } else {
      match.user2_answers = match.user2_answers.concat(answers);
    }
    
    // 检查是否双方都提交了答案
    const currentRoundAnswers1 = match.user1_answers.length / 2;
    const currentRoundAnswers2 = match.user2_answers.length / 2;
    
    let roundComplete = false;
    
    // 如果双方都完成了当前回合
    if (currentRoundAnswers1 >= match.current_round && currentRoundAnswers2 >= match.current_round) {
      roundComplete = true;
      
      // TODO: 计算得分逻辑
      // 这里简化处理，假设答对一题得1分
      // 实际应根据文档中的计分规则实现
      
      // 进入下一回合或结束比赛
      if (match.current_round < 2) {
        match.current_round += 1;
      } else {
        match.status = 'finished';
      }
    }
    
    // 保存更新后的比赛
    await match.save();
    
    return res.status(200).json({
      success: true,
      message: '答案提交成功',
      roundComplete,
      matchStatus: match.status,
      currentRound: match.current_round
    });
    
  } catch (error) {
    console.error('提交答案失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，提交答案失败',
      error: error.message
    });
  }
};

/**
 * 获取对手当前回合进度
 * @route GET /api/match/:id/progress
 * @param {string} req.params.id - 比赛ID
 * @param {string} req.query.user - 用户ID
 * @returns {Object} 返回对手提交状态和得分
 */
exports.getOpponentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.user;
    
    if (!id || !userId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 查找比赛
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '比赛不存在'
      });
    }
    
    // 确认用户是比赛参与者
    if (userId != match.user1_id && userId != match.user2_id) {
      return res.status(403).json({
        success: false,
        message: '您不是该比赛的参与者'
      });
    }
    
    // 确定对手
    const isUser1 = userId == match.user1_id;
    const opponentAnswers = isUser1 ? match.user2_answers : match.user1_answers;
    const opponentScore = isUser1 ? match.user2_score : match.user1_score;
    
    // 判断对手是否已提交当前回合答案
    const opponentSubmitted = (opponentAnswers.length / 2) >= match.current_round;
    
    return res.status(200).json({
      success: true,
      opponentSubmitted,
      opponentRoundScore: opponentSubmitted ? opponentScore : null
    });
    
  } catch (error) {
    console.error('获取对手进度失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，获取对手进度失败',
      error: error.message
    });
  }
};

/**
 * 获取比赛结果
 * @route GET /api/match/:id/results
 * @param {string} req.params.id - 比赛ID
 * @returns {Object} 返回比赛结果信息
 */
exports.getMatchResults = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找比赛
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '比赛不存在'
      });
    }
    
    // 检查比赛是否已结束
    if (match.status !== 'finished') {
      return res.status(400).json({
        success: false,
        message: '比赛尚未结束，无法获取最终结果'
      });
    }
    
    // 构建结果数据
    const results = {
      user1_score: match.user1_score,
      user2_score: match.user2_score,
      rounds: [
        {
          round: 1,
          user1_correct: [true, false], // 示例数据，实际应根据比对答案生成
          user2_correct: [true, true]
        },
        {
          round: 2,
          user1_correct: [true, true],
          user2_correct: [false, true]
        }
      ],
      strategies: {
        round1: { 
          user1: match.user1_strategy, 
          user2: match.user2_strategy 
        },
        round2: { 
          user1: match.user1_strategy, 
          user2: match.user2_strategy 
        }
      }
    };
    
    return res.status(200).json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('获取比赛结果失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，获取比赛结果失败',
      error: error.message
    });
  }
}; 