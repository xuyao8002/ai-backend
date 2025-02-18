const express = require('express');
const UserModel = require('../models/UserModel');

const router = express.Router();

// 获取用户模型
router.get('/get', async (req, res) => {
  const userModels = await UserModel.find({ user_id: req.user.id });
  res.json(userModels);
});

// 保存用户模型
router.post('/save', async (req, res) => {
  const { model_id, api_key, base_url } = req.body;
  const userModel = new UserModel({
    user_id: req.user.id,
    model_id,
    api_key,
    base_url,
  });
  await userModel.save();
  res.json(userModel);
});

module.exports = router;
