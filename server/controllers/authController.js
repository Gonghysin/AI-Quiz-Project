const User = require('../models/User');

// 用户注册控制器
exports.register = async (req, res) => {
  console.log('=== 收到注册请求 ===');
  console.log('请求体:', req.body);
  console.log('请求头:', req.headers);

  try {
    const { userId, nickname } = req.body;
    console.log(`尝试注册: userId=${userId}, nickname=${nickname}`);

    // 基础验证
    if (!userId || !nickname) {
      console.log('验证失败: 缺少必要参数');
      return res.status(400).json({ success: false, message: '请提供用户ID和昵称' });
    }

    // 检查昵称是否已存在
    console.log('检查昵称是否已存在...');
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      console.log(`昵称 "${nickname}" 已被使用`);
      return res.status(400).json({ success: false, message: '该昵称已被使用' });
    }

    // 检查用户ID是否已存在
    console.log('检查用户ID是否已存在...');
    const existingUserId = await User.findOne({ userId });
    if (existingUserId) {
      console.log(`用户ID "${userId}" 已注册`);
      return res.status(400).json({ success: false, message: '该用户ID已注册' });
    }

    // 创建新用户
    console.log('创建新用户...');
    const newUser = new User({
      userId,
      nickname
    });

    // 保存到数据库
    console.log('保存到数据库...');
    await newUser.save();
    console.log('用户保存成功:', newUser);

    // 返回成功响应
    console.log('发送成功响应');
    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser._id,
        userId: newUser.userId,
        nickname: newUser.nickname
      }
    });
    console.log('注册流程完成');
  } catch (error) {
    console.error('注册过程发生错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ success: false, message: '服务器错误，注册失败' });
  }
};

// 用户登录控制器
exports.login = async (req, res) => {
  console.log('=== 收到登录请求 ===');
  console.log('请求体:', req.body);
  console.log('请求头:', req.headers);
  
  try {
    const { userId } = req.body;
    console.log(`尝试登录: userId=${userId}`);

    // 基础验证
    if (!userId) {
      console.log('验证失败: 缺少用户ID');
      return res.status(400).json({ success: false, message: '请提供用户ID' });
    }

    // 根据用户ID查询用户
    console.log('查询用户...');
    const user = await User.findOne({ userId });
    
    // 检查用户是否存在
    if (!user) {
      console.log(`用户 "${userId}" 不存在`);
      return res.status(404).json({ success: false, message: '用户不存在，请先注册' });
    }

    console.log('用户存在:', user);
    
    // 用户存在，返回用户信息
    console.log('发送成功响应');
    res.status(200).json({
      success: true,
      message: '登录成功',
      userId: user.userId,
      nickname: user.nickname
    });
    console.log('登录流程完成');
    
  } catch (error) {
    console.error('登录过程发生错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ success: false, message: '服务器错误，登录失败' });
  }
}; 