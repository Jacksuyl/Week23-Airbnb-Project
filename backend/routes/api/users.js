const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validateSignup } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();


// 用户注册路由signup
router.post('/', validateSignup, async (req, res, next) => {
  const { email, username,password, firstName, lastName } = req.body;
  
  //check exist
const existingUser =  await User.findOne ({
  where: {
    [Op.or]: [{ email }, {username}]
  }
});
if (existingUser){
  const err = new Error ("User already exists");
  err.status =500;
  err.errors = {};
  if(existingUser.email === email){
    err.errors.email = "User with that email already exists";
  }
  if(existingUser.username === username){
    err.errors.username = "User with that username already exists";
  }
  return next(err);
}

  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({ email, username, hashedPassword, firstName, lastName });

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
});




module.exports = router;
