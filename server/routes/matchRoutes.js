const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

/**
 * @route   POST /api/match
 * @desc    创建新比赛
 * @access  Public (无需认证)
 */
router.post('/', matchController.createMatch);

/**
 * @route   POST /api/match/request
 * @desc    请求匹配比赛
 * @access  Public (无需认证)
 */
router.post('/request', matchController.requestMatch);

/**
 * @route   POST /api/match/cancel
 * @desc    取消匹配请求
 * @access  Public (无需认证)
 */
router.post('/cancel', matchController.cancelMatch);

/**
 * @route   GET /api/match/status
 * @desc    获取当前匹配状态
 * @access  Public (无需认证)
 */
router.get('/status', matchController.getMatchStatus);

/**
 * @route   POST /api/match/join
 * @desc    加入等待中的比赛
 * @access  Public (无需认证)
 */
router.post('/join', matchController.joinMatch);

/**
 * @route   POST /api/match/:id/choose-strategy/:round
 * @desc    选择特定回合的策略（给对方选择题目难度）
 * @access  Public (无需认证)
 */
router.post('/:id/choose-strategy/:round', matchController.chooseStrategy);

/**
 * @route   GET /api/match/:id/questions
 * @desc    获取比赛题目
 * @access  Public (无需认证)
 */
router.get('/:id/questions', matchController.getQuestions);

/**
 * @route   POST /api/match/:id/submit
 * @desc    提交答题结果
 * @access  Public (无需认证)
 */
router.post('/:id/submit', matchController.submitAnswers);

/**
 * @route   GET /api/match/:id/progress
 * @desc    获取对手当前回合进度
 * @access  Public (无需认证)
 */
router.get('/:id/progress', matchController.getOpponentProgress);

/**
 * @route   GET /api/match/:id/results
 * @desc    获取比赛结果
 * @access  Public (无需认证)
 */
router.get('/:id/results', matchController.getMatchResults);

/**
 * @route   POST /api/match/:id/lock-questions
 * @desc    锁定选择的题目
 * @access  Public (无需认证)
 */
router.post('/:id/lock-questions', matchController.lockQuestions);

module.exports = router; 