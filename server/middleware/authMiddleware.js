const jwt = require('jsonwebtoken');

/**
 * JWT认证中间件
 * 从请求头的 Authorization: Bearer <token> 中提取token
 * 验证token，验证通过后将userId存入req.user
 */
const auth = (req, res, next) => {
  try {
    // 从Authorization头中获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: '无访问权限，未提供认证token' 
      });
    }
    
    // 提取token (去掉'Bearer '前缀)
    const token = authHeader.replace('Bearer ', '');
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将解码后的userId存入req.user
    req.user = decoded.userId;
    
    // 继续下一步
    next();
  } catch (error) {
    // 根据错误类型返回不同的错误信息
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'token已过期，请重新登录' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: '无效的token' 
      });
    }
    
    // 其他错误
    return res.status(401).json({ 
      success: false, 
      message: '认证失败', 
      error: error.message 
    });
  }
};

module.exports = auth; 