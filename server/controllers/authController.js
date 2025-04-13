const User = require('../models/User');

// 用户注册控制器
exports.register = async (req, res) => {
  try {
    const { userId, nickname } = req.body;

    // 基础验证
    if (!userId || !nickname) {
      return res.status(400).json({ success: false, message: '请提供用户ID和昵称' });
    }

    // 检查昵称是否已存在
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return res.status(400).json({ success: false, message: '该昵称已被使用' });
    }

    // 检查用户ID是否已存在
    const existingUserId = await User.findOne({ userId });
    if (existingUserId) {
      return res.status(400).json({ success: false, message: '该用户ID已注册' });
    }

    // 创建新用户
    const newUser = new User({
      userId,
      nickname
    });

    // 保存到数据库
    await newUser.save();

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser._id,
        userId: newUser.userId,
        nickname: newUser.nickname
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '服务器错误，注册失败' });
  }
};

// 用户登录控制器
exports.login = async (req, res) => {
  try {
    const { userId } = req.body;

    // 基础验证
    if (!userId) {
      return res.status(400).json({ success: false, message: '请提供用户ID' });
    }

    // 根据用户ID查询用户
    const user = await User.findOne({ userId });
    
    // 检查用户是否存在
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在，请先注册' });
    }

    // 用户存在，返回用户信息
    res.status(200).json({
      success: true,
      message: '登录成功',
      user: {
        id: user._id,
        nickname: user.nickname
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误，登录失败' });
  }
}; 