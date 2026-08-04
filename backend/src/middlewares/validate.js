const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const message = errorArray.map((e) => e.msg).join(', ');
    
    const err = new Error(message);
    err.status = 400;
    err.isValidation = true;
    err.details = errorArray.map((e) => ({
      field: e.path || e.param,
      message: e.msg,
      value: e.value,
    }));
    
    return next(err);
  }
  next();
}

module.exports = validate;
