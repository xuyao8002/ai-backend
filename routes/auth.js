const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../config/redis');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
  redisClient.set(token, JSON.stringify(user));

  res.json({ token });
});

module.exports = router;
