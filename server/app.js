const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const questionRoutes = require('./routes/questionRoutes');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/questions', questionRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.send('AI知识竞赛API服务正在运行');
});

// 添加调试信息
console.log("当前加载的matchRoutes路径:", require.resolve('./routes/matchRoutes'));
console.log("当前加载的questionRoutes路径:", require.resolve('./routes/questionRoutes'));

// 数据库连接
mongoose.connect('mongodb://localhost:27017/ai-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('数据库连接成功'))
.catch(err => console.error('数据库连接失败:', err));

module.exports = app;
