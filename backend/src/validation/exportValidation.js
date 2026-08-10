const { query } = require('express-validator');
const validate = require('../middlewares/validate');

const exportRules = [
  query('start_date')
    .optional()
    .isDate()
    .withMessage('start_date must be a valid date'),
  query('end_date')
    .optional()
    .isDate()
    .withMessage('end_date must be a valid date'),
];

const exportTransactions = [...exportRules, validate];

module.exports = { exportTransactions };
