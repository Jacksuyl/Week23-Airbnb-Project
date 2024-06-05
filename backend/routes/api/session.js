const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();


// 用户登录路由
router.post(
    '/', async (req, res, next) => {
      const { credential, password } = req.body;// 从请求体中解构出凭证和密码
   // 查找用户，通过用户名或邮箱匹配
   //unscoped 是 Sequelize 中的方法，用于临时移除模型的默认作用域（scope），
   //从而可以访问和操作模型中的所有属性。
      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
  // 如果用户不存在或者密码不匹配，返回登录失败错误
      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' };
        return next(err);
      }
   // 创建安全的用户对象，不包含敏感信息
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
  // 设置 JWT Cookie
      await setTokenCookie(res, safeUser);
  // 返回安全的用户信息
      return res.json({
        user: safeUser
      });
    }
  );



module.exports = router;