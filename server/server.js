const app = require('./app');

// 设置端口
const PORT = process.env.PORT || 5001;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
