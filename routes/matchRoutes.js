const express = require('express');
const router = express.Router();
const { createMatch } = require('../controllers/matchController');

/**
 * 比赛相关路由
 */

// 创建比赛路由
// POST /api/match
router.post('/', createMatch);

module.exports = router; 