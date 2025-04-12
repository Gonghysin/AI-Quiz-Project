const User = require('../models/User');

// 用户注册控制器
exports.register = async (req, res) => {
  try {
    const { id2050, nickname } = req.body;

    // 基础验证
    if (!id2050 || !nickname) {
      return res.status(400).json({ success: false, message: '请提供ID2050和昵称' });
    }

    // 检查昵称是否已存在
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return res.status(400).json({ success: false, message: '该昵称已被使用' });
    }

    // 检查ID2050是否已存在
    const existingId2050 = await User.findOne({ id2050 });
    if (existingId2050) {
      return res.status(400).json({ success: false, message: '该ID2050已注册' });
    }

    // 创建新用户
    const newUser = new User({
      id2050,
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
        id2050: newUser.id2050,
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
    const { id2050 } = req.body;

    // 基础验证
    if (!id2050) {
      return res.status(400).json({ success: false, message: '请提供ID2050' });
    }

    // 根据ID2050查询用户
    const user = await User.findOne({ id2050 });
    
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