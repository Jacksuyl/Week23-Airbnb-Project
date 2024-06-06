const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
     // 从请求对象中提取验证结果
  const validationErrors = validationResult(req);

  //console.log("*****", validationErrors, typeof validationErrors)
// 如果验证错误不为空，处理错误
  if (!validationErrors.isEmpty()) { 
    // 初始化一个空对象来存储格式化的错误信息
    const errors = {};
    //
     // 遍历验证错误数组，将每个错误的路径和消息存储在 errors 对象中
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

module.exports = {
  handleValidationErrors
};