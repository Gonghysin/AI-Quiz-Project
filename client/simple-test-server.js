// client/simple-test-server.js
const express = require('express');
const app = express();
const PORT = 8080;

// 内存中存储用户数据
const users = [
  { userId: "user1", nickname: "测试用户1" },
  { userId: "user2", nickname: "测试用户2" }
];

// 内存中存储比赛数据
const matches = [];

// 内存中存储匹配请求
const matchRequests = {};

// 简易题库
const questionPool = {
  easy: [
    {
      questionId: 'e1',
      questionText: 'AI领域中，CNN是指？',
      options: ['卷积神经网络', '循环神经网络', '自然语言处理', '强化学习'],
      answer: 'A',
      difficulty: 'easy'
    },
    {
      questionId: 'e2',
      questionText: 'AlphaGo是哪家公司开发的？',
      options: ['谷歌', '微软', 'OpenAI', '英伟达'],
      answer: 'A',
      difficulty: 'easy'
    },
    {
      questionId: 'e3',
      questionText: '以下哪个不是大语言模型？',
      options: ['GPT-4', 'Claude', 'DALLE-3', 'Llama'],
      answer: 'C',
      difficulty: 'easy'
    },
    // 为简化起见，只提供3个简单题目
  ],
  hard: [
    {
      questionId: 'h1',
      questionText: '以下哪个模型架构最不适合处理序列数据？',
      options: ['RNN', 'LSTM', 'CNN', 'Transformer'],
      answer: 'C',
      difficulty: 'hard'
    },
    {
      questionId: 'h2',
      questionText: 'AlphaFold是解决什么问题的AI系统？',
      options: ['围棋对弈', '蛋白质折叠预测', '自动驾驶', '图像生成'],
      answer: 'B',
      difficulty: 'hard'
    },
    {
      questionId: 'h3',
      questionText: '哪一年图灵测试(Turing Test)被提出？',
      options: ['1950', '1956', '1964', '1970'],
      answer: 'A',
      difficulty: 'hard'
    },
    // 为简化起见，只提供3个困难题目
  ]
};

// 生成随机ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// 获取随机题目
function getRandomQuestions(difficulty, count = 50) {
  const questions = questionPool[difficulty];
  // 为了简化，我们复制现有题目直到达到所需数量
  const result = [];
  while (result.length < count) {
    result.push(...questions.map(q => ({...q})));
  }
  // 只返回所需数量
  return result.slice(0, count);
}

// 配置Express服务器
app.use(express.json());

// 登录API
app.post('/api/auth/login', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 查找用户
  const user = users.find(u => u.userId === userId);
  
  if (user) {
    console.log(`用户 ${userId} 登录成功`);
    return res.json({
      success: true,
      userId: user.userId,
      nickname: user.nickname
    });
  } else {
    // 自动创建新用户
    const newUser = {
      userId,
      nickname: `用户${userId}`
    };
    users.push(newUser);
    
    console.log(`新用户 ${userId} 创建并登录成功`);
    return res.json({
      success: true,
      userId: newUser.userId,
      nickname: newUser.nickname
    });
  }
});

// 创建比赛API
app.post('/api/match', (req, res) => {
  const { user1_id } = req.body;
  
  if (!user1_id) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 查找用户
  const user1 = users.find(u => u.userId === user1_id);
  
  if (!user1) {
    return res.status(404).json({ 
      success: false,
      message: '用户不存在' 
    });
  }
  
  // 创建新比赛
  const matchId = generateId();
  const newMatch = {
    matchId,
    user1_id,
    user2_id: null,
    strategies: {
      round1: {
        user1: null,
        user2: null
      },
      round2: {
        user1: null,
        user2: null
      }
    },
    user1_questions: [],
    user2_questions: [],
    user1_answers: [],
    user2_answers: [],
    user1_score: 0,
    user2_score: 0,
    current_round: 1,
    status: 'waiting'
  };
  
  matches.push(newMatch);
  console.log(`比赛 ${matchId} 创建成功, 玩家1: ${user1_id}`);
  
  return res.json({
    success: true,
    matchId,
    status: 'waiting'
  });
});

// 通过对手ID请求匹配API
app.post('/api/match/request', (req, res) => {
  const { userId, targetId } = req.body;
  
  if (!userId || !targetId) {
    return res.status(400).json({ 
      success: false,
      message: '请提供用户ID和对手ID' 
    });
  }
  
  // 查找自己和目标用户
  const user = users.find(u => u.userId === userId);
  const targetUser = users.find(u => u.userId === targetId);
  
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: '用户不存在' 
    });
  }
  
  if (!targetUser) {
    return res.status(404).json({ 
      success: false,
      message: '对手不存在' 
    });
  }
  
  // 先查找目标用户是否已创建等待中的比赛
  const existingMatch = matches.find(m => 
    m.user1_id === targetId && 
    m.status === 'waiting'
  );
  
  let matchId;
  let status;
  
  if (existingMatch) {
    // 加入已有比赛
    existingMatch.user2_id = userId;
    existingMatch.status = 'ready';
    matchId = existingMatch.matchId;
    status = 'ready';
    console.log(`用户 ${userId} 加入了 ${targetId} 创建的比赛 ${matchId}`);
  } else {
    // 如果目标用户没有创建比赛，则创建一个新比赛
    matchId = generateId();
    const newMatch = {
      matchId,
      user1_id: userId,
      user2_id: targetId,
      strategies: {
        round1: {
          user1: null,
          user2: null
        },
        round2: {
          user1: null,
          user2: null
        }
      },
      user1_questions: [],
      user2_questions: [],
      user1_answers: [],
      user2_answers: [],
      user1_score: 0,
      user2_score: 0,
      current_round: 1,
      status: 'ready'
    };
    
    matches.push(newMatch);
    status = 'ready';
    console.log(`用户 ${userId} 请求与 ${targetId} 匹配，创建新比赛 ${matchId}`);
  }
  
  return res.json({
    success: true,
    matchId,
    status,
    opponentNickname: targetUser.nickname
  });
});

// 取消匹配请求API
app.post('/api/match/cancel', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 删除该用户的匹配请求
  delete matchRequests[userId];
  
  // 删除该用户创建但尚未匹配的比赛
  const index = matches.findIndex(m => m.user1_id === userId && m.status === 'waiting');
  
  if (index !== -1) {
    matches.splice(index, 1);
    console.log(`用户 ${userId} 取消了匹配请求`);
  }
  
  return res.json({
    success: true,
    message: '匹配请求已取消'
  });
});

// 获取匹配状态API
app.get('/api/match/status', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 查找该用户的未完成比赛
  const match = matches.find(m => 
    (m.user1_id === userId || m.user2_id === userId) && 
    m.status !== 'finished'
  );
  
  if (!match) {
    return res.json({
      success: true,
      status: 'none',
      message: '没有进行中的比赛'
    });
  }
  
  // 获取对手信息
  const isUser1 = match.user1_id === userId;
  const opponentId = isUser1 ? match.user2_id : match.user1_id;
  const opponent = users.find(u => u.userId === opponentId);
  
  return res.json({
    success: true,
    status: match.status,
    matchId: match.matchId,
    opponentId,
    opponentNickname: opponent ? opponent.nickname : '对手',
    currentRound: match.current_round
  });
});

// 加入比赛API
app.post('/api/match/join', (req, res) => {
  const userId = req.body.userId || req.body.user2_id;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 查找用户
  const user = users.find(u => u.userId === userId);
  
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: '用户不存在' 
    });
  }
  
  // 查找等待中的比赛
  const waitingMatch = matches.find(m => m.status === 'waiting');
  
  if (!waitingMatch) {
    return res.status(404).json({ 
      success: false,
      message: '没有等待中的比赛' 
    });
  }
  
  // 更新比赛信息
  waitingMatch.user2_id = userId;
  waitingMatch.status = 'ready';
  
  console.log(`玩家 ${userId} 加入比赛 ${waitingMatch.matchId}`);
  
  return res.json({
    success: true,
    matchId: waitingMatch.matchId,
    status: 'ready'
  });
});

// 选择策略API (新版，支持round参数)
app.post('/api/match/:id/choose-strategy/:round', (req, res) => {
  const { id, round } = req.params;
  const { userId, strategy } = req.body;
  
  if (!userId || !strategy) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID和策略是必需的' 
    });
  }
  
  // 验证轮次是否有效
  if (round !== '1' && round !== '2') {
    return res.status(400).json({
      success: false,
      message: '无效的回合数，必须是1或2'
    });
  }
  
  // 查找比赛
  const match = matches.find(m => m.matchId === id);
  
  if (!match) {
    return res.status(404).json({ 
      success: false,
      message: '比赛不存在' 
    });
  }
  
  // 确定是哪位玩家并更新对应的策略
  const roundKey = `round${round}`;
  
  if (match.user1_id === userId) {
    match.strategies[roundKey].user1 = strategy;
  } else if (match.user2_id === userId) {
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
  
  console.log(`玩家 ${userId} 在比赛 ${id} 第 ${round} 轮中选择了策略: ${strategy}`);
  
  return res.json({
    success: true,
    message: '策略选择成功',
    matchStatus: match.status
  });
});

// 获取比赛进度API
app.get('/api/match/:id/progress', (req, res) => {
  const { id } = req.params;
  const { user } = req.query;
  
  if (!user) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 查找比赛
  const match = matches.find(m => m.matchId === id);
  
  if (!match) {
    return res.status(404).json({ 
      success: false,
      message: '比赛不存在' 
    });
  }
  
  // 确定是哪位玩家
  const isUser1 = match.user1_id === user;
  const isUser2 = match.user2_id === user;
  
  if (!isUser1 && !isUser2) {
    return res.status(403).json({ 
      success: false,
      message: '您不是该比赛的参与者' 
    });
  }
  
  // 获取对手信息
  const opponentId = isUser1 ? match.user2_id : match.user1_id;
  
  // 当前回合信息
  const roundKey = `round${match.current_round}`;
  
  // 检查对手是否已提交策略
  const opponentSubmittedStrategy = isUser1 
    ? !!match.strategies[roundKey].user2 
    : !!match.strategies[roundKey].user1;
  
  // 检查对手是否已提交答案
  const opponentSubmittedAnswers = isUser1 
    ? match.user2_answers.length >= match.current_round * 3
    : match.user1_answers.length >= match.current_round * 3;
  
  // 检查对手是否已加入（用于房间创建者等待对手加入的场景）
  const opponentJoined = match.user2_id !== null;
  
  // 获取对手昵称
  const opponentUser = users.find(u => u.userId === opponentId);
  const opponentNickname = opponentUser ? opponentUser.nickname : '对手';
  
  return res.json({
    success: true,
    matchStatus: match.status,
    currentRound: match.current_round,
    opponentSubmitted: opponentSubmittedAnswers,
    opponentSubmittedStrategy: opponentSubmittedStrategy,
    opponentJoined,
    opponentNickname,
    opponentRoundScore: 2 // 模拟得分
  });
});

// 锁定选择的题目API
app.post('/api/match/:id/lock-questions', (req, res) => {
  const { id } = req.params;
  const { userId, questions } = req.body;
  
  if (!userId || !questions) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID和题目ID是必需的' 
    });
  }
  
  // 查找比赛
  const match = matches.find(m => m.matchId === id);
  
  if (!match) {
    return res.status(404).json({ 
      success: false,
      message: '比赛不存在' 
    });
  }
  
  console.log(`用户 ${userId} 锁定了题目`);
  
  return res.json({
    success: true,
    message: '题目锁定成功'
  });
});

// 获取问题API
app.get('/api/match/:id/questions', (req, res) => {
  const { id } = req.params;
  const { user } = req.query;
  
  if (!user) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID是必需的' 
    });
  }
  
  // 查找比赛
  const match = matches.find(m => m.matchId === id);
  
  if (!match) {
    return res.status(404).json({ 
      success: false,
      message: '比赛不存在' 
    });
  }
  
  // 确定是哪位玩家
  const isUser1 = match.user1_id === user;
  const isUser2 = match.user2_id === user;
  
  if (!isUser1 && !isUser2) {
    return res.status(403).json({ 
      success: false,
      message: '您不是该比赛的参与者' 
    });
  }
  
  // 当前回合信息
  const roundKey = `round${match.current_round}`;
  
  // 获取对手的策略，决定题目难度
  const opponentStrategy = isUser1 
    ? match.strategies[roundKey].user2 
    : match.strategies[roundKey].user1;
  
  // 如果对手还未选择策略，返回错误
  if (!opponentStrategy) {
    return res.status(400).json({ 
      success: false,
      message: '对手尚未选择策略' 
    });
  }
  
  // 根据对手策略确定题目难度
  // 对手合作 = 简单题，对手背叛 = 难题
  const difficulty = opponentStrategy === 'cooperate' ? 'easy' : 'hard';
  
  // 获取随机题目
  const questions = getRandomQuestions(difficulty);
  
  return res.json(questions);
});

// 提交答案API
app.post('/api/match/:id/submit', (req, res) => {
  const { id } = req.params;
  const { userId, answers } = req.body;
  
  if (!userId || !answers) {
    return res.status(400).json({ 
      success: false,
      message: '用户ID和答案是必需的' 
    });
  }
  
  // 查找比赛
  const match = matches.find(m => m.matchId === id);
  
  if (!match) {
    return res.status(404).json({ 
      success: false,
      message: '比赛不存在' 
    });
  }
  
  // 更新答案
  if (match.user1_id === userId) {
    match.user1_answers = match.user1_answers.concat(answers);
  } else if (match.user2_id === userId) {
    match.user2_answers = match.user2_answers.concat(answers);
  } else {
    return res.status(403).json({ 
      success: false,
      message: '您不是该比赛的参与者' 
    });
  }
  
  console.log(`玩家 ${userId} 在比赛 ${id} 中提交了答案`);
  
  return res.json({
    success: true,
    message: '答案提交成功'
  });
});

// 获取比赛结果API
app.get('/api/match/:id/results', (req, res) => {
  const { id } = req.params;
  
  // 查找比赛
  const match = matches.find(m => m.matchId === id);
  
  if (!match) {
    return res.status(404).json({ 
      success: false,
      message: '比赛不存在' 
    });
  }
  
  // 简化实现，返回模拟数据
  return res.json({
    success: true,
    user1_id: match.user1_id,
    user2_id: match.user2_id,
    user1_score: 5,
    user2_score: 3,
    rounds: [
      {
        round: 1,
        user1_score: 3,
        user2_score: 2,
        user1_correct: [true, true, false],
        user2_correct: [true, false, false]
      }
    ],
    strategies: {
      round1: {
        user1: match.strategies.round1.user1 || 'cooperate',
        user2: match.strategies.round1.user2 || 'cooperate'
      }
    }
  });
});

// 其他API，用于调试
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/matches', (req, res) => {
  res.json(matches);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`简易测试服务器运行在 http://localhost:${PORT}`);
  console.log('可用的测试用户:', users.map(u => u.userId).join(', '));
});