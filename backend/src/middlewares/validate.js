const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    const err = new Error(message);
    err.status = 400;
    return next(err);
  }
  next();
}

module.exports = validate;
