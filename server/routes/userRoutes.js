const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// 注册接口
router.post('/register', userController.register);

// 登录接口
router.post('/login', userController.login);

// 测试token验证接口
router.get('/test-auth', auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token验证成功',
    userId: req.user
  });
});

module.exports = router; 