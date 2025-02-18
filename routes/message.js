const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// 保存消息
router.post('/save', async (req, res) => {
  const { id, model_id, role, content } = req.body;

  if (!id) {
    const newMessage = new Message({
      user_id: req.user.id,
      model_id,
      title: '新对话',
      messages: [{ role, content }],
    });
    await newMessage.save();
    return res.json({ id: newMessage._id });
  }

  const message = await Message.findById(id);
  message.messages.push({ role, content });
  await message.save();
  res.json({ id });
});

// 获取消息列表
router.get('/list', async (req, res) => {
  const messages = await Message.find({ user_id: req.user.id }).select('-messages');
  res.json(messages);
});

// 获取消息详情（分页）
router.get('/get', async (req, res) => {
  const { id, page = 1 } = req.query;
  const message = await Message.findById(id);
  const messages = message.messages.slice((page - 1) * 10, page * 10);
  res.json(messages);
});

module.exports = router;
