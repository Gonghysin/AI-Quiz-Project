const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// 上传题目
router.post('/', questionController.createQuestion);

// 获取题目池 (随机抽取50道题)
router.get('/pool', questionController.getQuestionPool);

// 获取单个题目
router.get('/:id', questionController.getQuestion);

// 更新题目
router.put('/:id', questionController.updateQuestion);

// 删除题目
router.delete('/:id', questionController.deleteQuestion);

module.exports = router; 