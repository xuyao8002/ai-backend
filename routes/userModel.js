const express = require('express');
const UserModel = require('../models/UserModel');

const router = express.Router();

// 获取用户模型
router.get('/get', async (req, res) => {
  const userModels = await UserModel.find({ user_id: req.user._id });
  res.json(userModels);
});

// 保存用户模型信息
router.post('/save', async (req, res) => {
  const { model_id, api_key, base_url } = req.body;
  const user_id = req.user._id; // 使用 req.user._id 获取用户 ID

  try {
    // 查找是否已存在对应的记录
    const existingUserModel = await UserModel.findOne({ user_id, model_id });

    if (existingUserModel) {
      // 如果记录已存在，更新 api_key 和 base_url
      existingUserModel.api_key = api_key;
      existingUserModel.base_url = base_url;
      await existingUserModel.save();
      res.json({ message: '用户模型配置更新成功' });
    } else {
      // 如果记录不存在，新增记录
      const newUserModel = new UserModel({
        user_id,
        model_id,
        api_key,
        base_url,
      });
      await newUserModel.save();
      res.json({ message: '用户模型配置新增成功' });
    }
  } catch (error) {
    console.error('保存用户模型配置失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;
