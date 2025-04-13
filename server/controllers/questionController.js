const Question = require('../models/Question');

/**
 * 上传新题目
 * @route POST /api/questions
 */
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, options, answer, difficulty, type, explanation } = req.body;

    // 数据验证
    if (!questionText || !options || !answer || !difficulty || !type) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 验证数据类型
    if (!Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ message: '选项必须是非空数组' });
    }

    if (!Array.isArray(answer) || answer.length === 0) {
      return res.status(400).json({ message: '答案必须是非空数组' });
    }

    // 验证难度值
    if (difficulty !== 'easy' && difficulty !== 'hard') {
      return res.status(400).json({ message: '难度值只能是 easy 或 hard' });
    }

    // 验证题目类型
    if (!['single', 'multiple', 'boolean'].includes(type)) {
      return res.status(400).json({ message: '题目类型只能是 single、multiple 或 boolean' });
    }

    // 创建新题目
    const newQuestion = new Question({
      questionText,
      options,
      answer,
      difficulty,
      type,
      explanation: explanation || ''
    });

    // 保存到数据库
    await newQuestion.save();

    res.status(201).json({
      success: true,
      data: newQuestion,
      message: '题目创建成功'
    });
  } catch (error) {
    console.error('创建题目失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取随机题目池
 * @route GET /api/questions/pool
 */
exports.getQuestionPool = async (req, res) => {
  try {
    const { difficulty, type } = req.query;
    const filter = {};

    // 应用筛选条件
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (type) {
      filter.type = type;
    }

    // 从数据库随机获取50道符合条件的题目
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: 50 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到符合条件的题目'
      });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('获取题目池失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取单个题目
 * @route GET /api/questions/:id
 */
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: '未找到该题目'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 更新题目
 * @route PUT /api/questions/:id
 */
exports.updateQuestion = async (req, res) => {
  try {
    const { questionText, options, answer, difficulty, type, explanation } = req.body;
    
    // 验证数据
    if (options && (!Array.isArray(options) || options.length === 0)) {
      return res.status(400).json({ message: '选项必须是非空数组' });
    }

    if (answer && (!Array.isArray(answer) || answer.length === 0)) {
      return res.status(400).json({ message: '答案必须是非空数组' });
    }

    if (difficulty && difficulty !== 'easy' && difficulty !== 'hard') {
      return res.status(400).json({ message: '难度值只能是 easy 或 hard' });
    }

    if (type && !['single', 'multiple', 'boolean'].includes(type)) {
      return res.status(400).json({ message: '题目类型只能是 single、multiple 或 boolean' });
    }

    // 更新题目
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { questionText, options, answer, difficulty, type, explanation },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: '未找到该题目'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedQuestion,
      message: '题目更新成功'
    });
  } catch (error) {
    console.error('更新题目失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 删除题目
 * @route DELETE /api/questions/:id
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: '未找到该题目'
      });
    }

    res.status(200).json({
      success: true,
      message: '题目删除成功'
    });
  } catch (error) {
    console.error('删除题目失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 