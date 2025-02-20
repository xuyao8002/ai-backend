const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../config/redis');

const router = express.Router();

// 登录接口
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  // 生成token，设置1小时超时
  const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });

  // 将token和用户信息存入Redis，并设置1小时超时
  redisClient.set(token, JSON.stringify(user), {
    EX: 3600, // 设置超时时间为3600秒（1小时）
  }, (err) => {
    if (err) {
      console.error('Redis存储失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
  });

  // 返回token和用户信息给前端
  res.json({ token, user: { username: user.username } });
});

// 退出登录接口
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: '未提供token' });
  }

  // 从Redis中删除token
  redisClient.del(token, (err) => {
    if (err) {
      console.error('Redis删除失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
  });
  res.json({ message: '退出登录成功' });	
});

module.exports = router;
