const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');

/**
 * @route   POST /api/match/request
 * @desc    请求匹配比赛
 * @access  Private (需要认证)
 */
router.post('/request', auth, matchController.requestMatch);

/**
 * @route   POST /api/match/cancel
 * @desc    取消匹配请求
 * @access  Private (需要认证)
 */
router.post('/cancel', auth, matchController.cancelMatch);

/**
 * @route   GET /api/match/status
 * @desc    获取当前匹配状态
 * @access  Private (需要认证)
 */
router.get('/status', auth, matchController.getMatchStatus);

/**
 * @route   POST /api/match/join
 * @desc    加入等待中的比赛
 * @access  Private (需要认证)
 */
router.post('/join', auth, matchController.joinMatch);

/**
 * @route   POST /api/match/:id/choose-strategy
 * @desc    选择策略（给对方选择题目难度）
 * @access  Private (需要认证)
 */
router.post('/:id/choose-strategy', auth, matchController.chooseStrategy);

module.exports = router; 