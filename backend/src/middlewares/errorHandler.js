const {fail} = require('../utils/response');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
    return fail(res, message, status, { errors: err.stack });
  }

  if (status === 400 && err.isValidation) {
    return fail(res, 'Validation failed', status, { errors: err.details });
  }


  fail(res, message, status, null);
}

module.exports = errorHandler;
