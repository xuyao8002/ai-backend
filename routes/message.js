const express = require('express');
const OpenAI = require('openai');
const Message = require('../models/Message');
const Model = require('../models/Model');
const UserModel = require('../models/UserModel');
const router = express.Router();


router.get('/chat', async (req, res) => {
  const { id, model_id, content } = req.query;
  const model = await Model.findById(model_id);  
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const user_id = req.user._id;
  const existingUserModel = await UserModel.findOne({ user_id, model_id });  
  const openai = new OpenAI({
    apiKey: existingUserModel.api_key, // 替换为你的 API Key
    baseURL: existingUserModel.base_url,
  });
  let message = id === '-1' ? null :  await Message.findById(id);
  if(!message){
    message = new Message({
      user_id: user_id,
      model_id:model_id,
      title:content.slice(0, 15),
      messages:[{ role:'user',content: content }],
    });  
    res.write(`data: ${JSON.stringify({ type: 'id', content: message._id })}\n\n`);
    res.flush();
  }else{
    message.messages.push({role:'user',content: content});
  }	  
  message.save();
  // 发送初始化消息
  res.write(`data: ${JSON.stringify({ type: 'init', message: '连接已建立' })}\n\n`);
  let reasoningContent = ""; // 定义完整思考过程
  let answerContent = ""; // 定义完整回复
  try {
    const completion = await openai.chat.completions.create({
      model: model.model_name, 
      //要支持多轮对话，需要在messages前面添加{'role': 'assistant', 'content':API 返回的 content}
      messages: [{ role: 'user', content: content }], // 使用入参中的 content
      stream: true,
    });

    for await (const chunk of completion) {
      // 处理 usage 信息
      if (!chunk.choices?.length) {
        res.write(`data: ${JSON.stringify({ type: 'usage', usage: chunk.usage })}\n\n`);
        continue;
      }

      const delta = chunk.choices[0].delta;

      // 处理空内容情况
      if (!delta.reasoning_content && !delta.content) {
        continue;
      }

      // 处理思考过程
      if (delta.reasoning_content) {
        res.write(`data: ${JSON.stringify({ type: 'reasoning', content: delta.reasoning_content })}\n\n`);
        reasoningContent += delta.reasoning_content;
      }

      // 处理回复内容
      if (delta.content) {
        res.write(`data: ${JSON.stringify({ type: 'answer', content: delta.content })}\n\n`);
        answerContent += delta.content;
      }
      // 刷新缓冲区，确保数据立即发送到客户端
      res.flush();
    }
  } catch (error) {
    console.error('SSE 推送失败:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: '服务器内部错误' })}\n\n`);
  } finally {
    // 关闭连接
    res.end();
  }
  message.messages.push({role:'assistant', content: reasoningContent + '\n' + answerContent});
  message.save();
});




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
  const messages = await Message.find({ user_id: req.user._id }).select('-messages');
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
