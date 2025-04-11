const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册
exports.register = async (req, res) => {
  try {
    const { userId, nickname } = req.body;

    // 检查必填字段
    if (!userId || !nickname) {
      return res.status(400).json({ message: '用户ID和昵称不能为空' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: '该用户ID已存在' });
    }

    // 创建新用户
    const user = new User({
      userId,
      nickname
    });

    await user.save();

    res.status(201).json({
      message: '注册成功',
      user: {
        userId: user.userId,
        nickname: user.nickname
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: '用户ID不能为空' });
    }

    // 查找用户
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 生成token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '4h' });

    res.status(200).json({
      message: '登录成功',
      user: {
        userId: user.userId,
        nickname: user.nickname,
        totalScore: user.totalScore,
        questionsCompleted: user.questionsCompleted
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 