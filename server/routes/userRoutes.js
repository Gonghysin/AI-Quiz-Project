const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 注册接口
router.post('/register', userController.register);

// 登录接口
router.post('/login', userController.login);

// 测试接口
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: '接口测试成功'
  });
});

module.exports = router; 