const express = require('express');
const { restoreUser } = require('../../utils/auth');
const router = express.Router();

// 恢复会话用户
router.get(
  '/',
  restoreUser,
  (req, res) => {
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };
      return res.json({
        user: safeUser
      });
    } else {
      return res.json({ user: null });
    }
  }
);

module.exports = router;
