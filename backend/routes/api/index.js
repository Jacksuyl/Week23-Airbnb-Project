
const router = require('express').Router();

// 导入会话路由和用户路由模块
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const reviewsRouter = require('./reviews.js');
const bookingsRouter = require('./bookings.js');

// 导入 restoreUser 中间件，用于恢复用户会话
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

// 将会话路由连接到路径
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter);
router.use('/reviews', reviewsRouter);
router.use('/bookings', bookingsRouter);

// 测试路由，用于测试请求体内容
router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});


// 导出路由模块，以便在其他地方使用
module.exports = router;