const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const modelRoutes = require('./routes/model');
const userModelRoutes = require('./routes/userModel');
const authMiddleware = require('./middlewares/authMiddleware'); // 引入中间件

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 路由
// 登录接口不需要验证token
app.use('/auth', authRoutes);
// 其他接口需要验证token
app.use(authMiddleware); // 应用中间件
app.use('/message', messageRoutes);
app.use('/model', modelRoutes);
app.use('/userModel', userModelRoutes);

module.exports = app;
