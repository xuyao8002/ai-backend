const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const authMiddleware = async (req, res, next) => {
  // 从请求头中获取token
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: 401, message: '用户未登录' });
  }

  try {
    // 验证token是否有效
    const decoded = jwt.verify(token, 'secret_key');

    // 从Redis中获取用户信息
    const user = await redisClient.get(token);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户未登录' });
    }

    // 将用户信息挂载到请求对象上
    req.user = JSON.parse(user);
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '无效的token' });
  }
};

module.exports = authMiddleware;
