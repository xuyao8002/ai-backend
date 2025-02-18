const express = require('express');
const Model = require('../models/Model');

const router = express.Router();

// 获取模型列表
router.get('/list', async (req, res) => {
  const models = await Model.find();
  res.json(models);
});

module.exports = router;
