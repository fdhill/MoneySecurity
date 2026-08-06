const {fail} = require('../utils/response');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(
    { err, method: req.method, path: req.originalUrl, status },
    'request failed',
  );

  if (status === 400 && err.isValidation) {
    return fail(res, 'Validation failed', status, { errors: err.details });
  }

  if (process.env.NODE_ENV === 'development') {
    return fail(res, message, status, { errors: err.stack });
  }

  fail(res, message, status, null);
}

module.exports = errorHandler;
