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
      user1_id,                // 设置创建者ID
      user2_id: null,          // 初始时对手为空
      strategies: {            // 初始化两轮策略
        round1: {
          user1: null,
          user2: null
        },
        round2: {
          user1: null,
          user2: null
        }
      },
      user1_questions: [],     // 初始时题目为空数组
      user2_questions: [],     // 初始时题目为空数组
      user1_answers: [],       // 初始时答案为空数组
      user2_answers: [],       // 初始时答案为空数组
      user1_score: 0,          // 初始时分数为0
      user2_score: 0,          // 初始时分数为0
      current_round: 1,        // 设置当前回合为第1回合
      status: 'waiting'        // 设置初始状态为等待中
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
 * 选择策略（给对方选择题目难度）
 * @route POST /api/match/:id/choose-strategy/:round
 * @param {string} req.params.id - 比赛ID
 * @param {string} req.params.round - 回合数(1或2)
 * @param {string} req.body.userId - 玩家ID
 * @param {string} req.body.strategy - 策略选择（'cooperate'或'betray'）
 * @returns {Object} 返回确认状态
 */
exports.chooseStrategy = async (req, res) => {
  try {
    const { id, round } = req.params;
    const { userId, strategy } = req.body;
    
    // 基本验证
    if (!id || !userId || !strategy || !round) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 验证轮次是否有效
    if (round !== '1' && round !== '2') {
      return res.status(400).json({
        success: false,
        message: '无效的回合数，必须是1或2'
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
    
    const roundKey = `round${round}`;
    
    // 确定是哪位玩家并更新对应的策略
    if (userId == match.user1_id) {
      match.strategies[roundKey].user1 = strategy;
    } else if (userId == match.user2_id) {
      match.strategies[roundKey].user2 = strategy;
    } else {
      return res.status(403).json({
        success: false,
        message: '您不是该比赛的参与者'
      });
    }
    
    // 如果当前回合双方都选择了策略，比赛状态改为进行中
    const currentRoundKey = `round${match.current_round}`;
    if (match.strategies[currentRoundKey].user1 && match.strategies[currentRoundKey].user2) {
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
    const userId = req.body.userId; // 从请求体获取userId，而不是从认证中间件
    const { targetId } = req.body; // 对手的2050 ID

    if (!userId || !targetId) {
      return res.status(400).json({
        success: false,
        message: '请提供用户ID和对手ID'
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
    const userId = req.body.userId; // 从请求体获取userId
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '请提供用户ID'
      });
    }
    
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
    const userId = req.query.userId; // 从查询参数获取userId
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '请提供用户ID'
      });
    }
    
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
    
    // 确定对手和当前轮次
    const isUser1 = userId == match.user1_id;
    const currentRound = match.current_round;
    const roundKey = `round${currentRound}`;
    
    // 确定对手的策略（对手给自己选的难度）
    const opponentStrategy = isUser1 
      ? match.strategies[roundKey].user2 
      : match.strategies[roundKey].user1;
    
    // 根据对手策略确定题目难度（cooperate=简单题，betray=难题）
    const difficulty = opponentStrategy === 'cooperate' ? 'easy' : 'hard';
    
    // 从数据库中随机抽取50道指定难度的题目
    const Question = require('../models/Question');
    const questions = await Question.aggregate([
      { $match: { difficulty } },
      { $sample: { size: 50 } },
      { 
        $project: { 
          _id: 1, 
          questionText: 1, 
          options: 1, 
          type: 1,
          difficulty: 1
          // 不返回 answer 字段
        } 
      }
    ]);
    
    // 确保有足够的题目
    if (questions.length < 50) {
      console.warn(`警告: 难度为 ${difficulty} 的题目不足50道，仅返回 ${questions.length} 道题`);
    }
    
    return res.status(200).json({
      success: true,
      questions,
      currentRound: match.current_round,
      difficulty
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
    if (!id || !userId || !answers || !Array.isArray(answers) || answers.length !== 2) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数或格式不正确，需要提供两个答案'
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
    
    // 检查比赛状态
    if (match.status === 'finished') {
      return res.status(400).json({
        success: false,
        message: '比赛已结束，无法提交答案'
      });
    }
    
    // 检查是否已提交过答案
    const userAnswersField = isUser1 ? 'user1_answers' : 'user2_answers';
    const currentRoundIndex = (match.current_round - 1) * 2;
    
    if (match[userAnswersField] && 
        match[userAnswersField].length >= (match.current_round * 2)) {
      return res.status(400).json({
        success: false,
        message: '本轮答案已提交，不能重复提交'
      });
    }
    
    // 更新玩家答案
    if (isUser1) {
      // 确保数组长度足够
      while (match.user1_answers.length < currentRoundIndex) {
        match.user1_answers.push(null);
      }
      match.user1_answers = match.user1_answers.concat(answers);
    } else {
      while (match.user2_answers.length < currentRoundIndex) {
        match.user2_answers.push(null);
      }
      match.user2_answers = match.user2_answers.concat(answers);
    }
    
    // 检查是否双方都提交了当前回合的答案
    const user1RoundAnswers = match.user1_answers.length / 2;
    const user2RoundAnswers = match.user2_answers.length / 2;
    
    let roundComplete = false;
    let roundScores = { user1: 0, user2: 0 };
    let correctAnswers = { user1: [false, false], user2: [false, false] };
    
    // 如果双方都完成了当前回合
    if (user1RoundAnswers >= match.current_round && user2RoundAnswers >= match.current_round) {
      roundComplete = true;
      
      // 获取当前轮次
      const currentRound = match.current_round;
      const roundKey = `round${currentRound}`;
      
      // 获取双方策略
      const user1Strategy = match.strategies[roundKey].user1;
      const user2Strategy = match.strategies[roundKey].user2;
      
      // 获取本轮答案
      const user1Answers = match.user1_answers.slice((currentRound-1)*2, currentRound*2);
      const user2Answers = match.user2_answers.slice((currentRound-1)*2, currentRound*2);
      
      // 假设我们有题目的正确答案（实际应该从题目数据中获取）
      // 这里简化处理，假设有user1_questions和user2_questions字段包含题目信息
      const user1Questions = match.user1_questions.slice((currentRound-1)*2, currentRound*2);
      const user2Questions = match.user2_questions.slice((currentRound-1)*2, currentRound*2);
      
      // 确定答题正确性
      for (let i = 0; i < 2; i++) {
        // 这里假设每个题目对象有一个answer字段表示正确答案
        // 实际情况可能需要调整此逻辑
        if (user1Questions[i] && user1Answers[i]) {
          correctAnswers.user1[i] = user1Questions[i].answer.includes(user1Answers[i]);
        }
        
        if (user2Questions[i] && user2Answers[i]) {
          correctAnswers.user2[i] = user2Questions[i].answer.includes(user2Answers[i]);
        }
      }
      
      // 计算得分
      for (let i = 0; i < 2; i++) {
        // 应用计分规则
        const [user1Score, user2Score] = calculateScore(
          correctAnswers.user1[i],
          correctAnswers.user2[i],
          user1Strategy,
          user2Strategy
        );
        
        roundScores.user1 += user1Score;
        roundScores.user2 += user2Score;
      }
      
      // 更新总得分
      match.user1_score = (match.user1_score || 0) + roundScores.user1;
      match.user2_score = (match.user2_score || 0) + roundScores.user2;
      
      // 进入下一回合或结束比赛
      if (match.current_round < 2) {
        match.current_round += 1;
      } else {
        match.status = 'finished';
      }
    }
    
    // 保存更新后的比赛
    await match.save();
    
    if (roundComplete) {
      return res.status(200).json({
        success: true,
        message: '答案提交成功，双方本轮得分已计算',
        user1_score: match.user1_score,
        user2_score: match.user2_score,
        current_round_scores: roundScores,
        round: match.current_round - 1,
        user1_correct: correctAnswers.user1,
        user2_correct: correctAnswers.user2,
        matchStatus: match.status
      });
    } else {
      return res.status(200).json({
        success: true,
        message: '答案提交成功，等待对手提交',
        matchStatus: match.status,
        currentRound: match.current_round
      });
    }
    
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
 * 计算单题得分
 * @param {Boolean} user1Correct - 用户1是否答对
 * @param {Boolean} user2Correct - 用户2是否答对
 * @param {String} user1Strategy - 用户1策略 ('cooperate'|'betray')
 * @param {String} user2Strategy - 用户2策略 ('cooperate'|'betray')
 * @returns {Array} - [用户1得分, 用户2得分]
 */
function calculateScore(user1Correct, user2Correct, user1Strategy, user2Strategy) {
  // 双方都合作
  if (user1Strategy === 'cooperate' && user2Strategy === 'cooperate') {
    if (user1Correct && user2Correct) {
      return [3, 3]; // 双方都答对
    } else if (user1Correct && !user2Correct) {
      return [3, 0]; // 用户1对，用户2错
    } else if (!user1Correct && user2Correct) {
      return [0, 3]; // 用户1错，用户2对
    } else {
      return [0, 0]; // 双方都答错
    }
  }
  
  // 双方都背叛
  if (user1Strategy === 'betray' && user2Strategy === 'betray') {
    if (user1Correct && user2Correct) {
      return [2, 2]; // 双方都答对
    } else if (user1Correct && !user2Correct) {
      return [5, 0]; // 用户1对，用户2错
    } else if (!user1Correct && user2Correct) {
      return [0, 5]; // 用户1错，用户2对
    } else {
      return [0, 0]; // 双方都答错
    }
  }
  
  // 用户1背叛，用户2合作
  if (user1Strategy === 'betray' && user2Strategy === 'cooperate') {
    if (user1Correct && user2Correct) {
      return [2, 4]; // 双方都答对
    } else if (user1Correct && !user2Correct) {
      return [5, 0]; // 用户1对，用户2错
    } else if (!user1Correct && user2Correct) {
      return [0, 6]; // 用户1错，用户2对
    } else {
      return [0, 1]; // 双方都答错
    }
  }
  
  // 用户1合作，用户2背叛
  if (user1Strategy === 'cooperate' && user2Strategy === 'betray') {
    if (user1Correct && user2Correct) {
      return [4, 2]; // 双方都答对
    } else if (user1Correct && !user2Correct) {
      return [6, 0]; // 用户1对，用户2错
    } else if (!user1Correct && user2Correct) {
      return [0, 5]; // 用户1错，用户2对
    } else {
      return [1, 0]; // 双方都答错
    }
  }
  
  // 默认情况
  return [0, 0];
}

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
      strategies: match.strategies // 直接使用新的strategies结构
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

/**
 * 锁定题目
 * @route POST /api/match/:id/lock-questions
 * @param {string} req.params.id - 比赛ID
 * @param {string} req.body.userId - 用户ID
 * @param {Array} req.body.questionIds - 所选题目ID数组（两道题）
 * @returns {Object} 返回确认状态
 */
exports.lockQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, questionIds } = req.body;
    
    // 基本参数验证
    if (!id || !userId || !questionIds) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 验证选择的题目数量是否正确（每轮两道题）
    if (!Array.isArray(questionIds) || questionIds.length !== 2) {
      return res.status(400).json({
        success: false,
        message: '每轮必须选择两道题目'
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
    
    // 确保比赛状态为进行中
    if (match.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '比赛未在进行中状态，无法锁定题目'
      });
    }
    
    // 从数据库中获取选定的题目
    const Question = require('../models/Question');
    const selectedQuestions = await Question.find({
      _id: { $in: questionIds }
    });
    
    // 验证是否找到了所有指定的题目
    if (selectedQuestions.length !== 2) {
      return res.status(404).json({
        success: false,
        message: '无法找到指定的题目'
      });
    }
    
    // 确定是哪位玩家并更新其题目
    if (userId == match.user1_id) {
      // 检查用户1是否已经锁定过题目
      if (match.user1_questions && match.user1_questions.length > 0) {
        return res.status(400).json({
          success: false,
          message: '您已经锁定过本轮题目'
        });
      }
      // 更新用户1的题目
      match.user1_questions = selectedQuestions;
    } else if (userId == match.user2_id) {
      // 检查用户2是否已经锁定过题目
      if (match.user2_questions && match.user2_questions.length > 0) {
        return res.status(400).json({
          success: false,
          message: '您已经锁定过本轮题目'
        });
      }
      // 更新用户2的题目
      match.user2_questions = selectedQuestions;
    } else {
      return res.status(403).json({
        success: false,
        message: '您不是该比赛的参与者'
      });
    }
    
    // 保存更新后的比赛信息
    await match.save();
    
    return res.status(200).json({
      success: true,
      message: '题目锁定成功',
      questions: selectedQuestions
    });
    
  } catch (error) {
    console.error('锁定题目失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，锁定题目失败',
      error: error.message
    });
  }
}; 