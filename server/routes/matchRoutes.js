const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');

/**
 * @route   POST /api/match
 * @desc    创建新比赛
 * @access  Public (测试阶段暂不需要认证)
 */
router.post('/', matchController.createMatch);

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

/**
 * @route   GET /api/match/:id/questions
 * @desc    获取比赛题目
 * @access  Private (需要认证)
 */
router.get('/:id/questions', auth, matchController.getQuestions);

/**
 * @route   POST /api/match/:id/submit
 * @desc    提交答题结果
 * @access  Private (需要认证)
 */
router.post('/:id/submit', auth, matchController.submitAnswers);

/**
 * @route   GET /api/match/:id/progress
 * @desc    获取对手当前回合进度
 * @access  Private (需要认证)
 */
router.get('/:id/progress', auth, matchController.getOpponentProgress);

/**
 * @route   GET /api/match/:id/results
 * @desc    获取比赛结果
 * @access  Private (需要认证)
 */
router.get('/:id/results', auth, matchController.getMatchResults);

module.exports = router; 