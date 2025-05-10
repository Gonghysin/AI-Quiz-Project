// 文件名：importQuestions.js
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Question = require('./models/Question');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-quiz-app')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

async function importQuestions() {
  try {
    // 读取Excel文件
    const workbook = xlsx.readFile('单选题库.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet, {header: ['question', 'options', 'answer', 'difficulty']});
    
    // 跳过表头
    const questions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row.question) continue; // 跳过空行
      
      // 处理选项 - 假设格式为"A选项A B选项B C选项C D选项D"
      const optionsText = row.options || '';
      // 使用正则表达式分割选项
      const optionsPattern = /([A-D][\s\.]?)(.*?)(?=(?:[A-D][\s\.]?)|$)/g;
      let match;
      const options = [];
      
      while ((match = optionsPattern.exec(optionsText)) !== null) {
        if (match[2].trim()) {
          options.push(`${match[1]}${match[2].trim()}`);
        }
      }
      
      // 如果无法提取选项，使用默认值
      if (options.length === 0) {
        options.push('A 选项A', 'B 选项B', 'C 选项C', 'D 选项D');
      }
      
      // 处理难度
      let difficulty = 'easy';
      if (row.difficulty === '困难') {
        difficulty = 'hard';
      }
      
      // 处理答案 - 转为数组
      const answer = [row.answer];
      
      const question = {
        questionText: row.question,
        options: options,
        answer: answer,
        difficulty: difficulty,
        type: 'single', // 全部为单选题
        explanation: '' // 默认为空
      };
      
      questions.push(question);
    }
    
    // 批量插入到数据库
    if (questions.length > 0) {
      await Question.insertMany(questions);
      console.log(`成功导入 ${questions.length} 道题目`);
    } else {
      console.log('没有导入任何题目，请检查数据格式');
    }
    
  } catch (error) {
    console.error('导入题目失败:', error);
  } finally {
    mongoose.disconnect();
  }
}

importQuestions();