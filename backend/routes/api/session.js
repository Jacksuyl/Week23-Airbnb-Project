const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validateLogin } = require('../../utils/validation')
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

//login
router.post(
  '/', validateLogin,
  async (req, res, next) => {
    const { credential, password } = req.body;
    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential
        }
      }
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      err.title = 'Invalid credentials';
      err.errors = { credential: 'The provided credentials were invalid.' };
      return next(err);
    }

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

// 获取当前用户信息
router.get('/', async (req, res) => {
  const { user } = req;
  if ( user ){
    res.status(200).json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    }
  });
} else{
  res.status(200).json({
    user: null
  });
}
});

module.exports = router;
