const { query } = require('express-validator');
const validate = require('../middlewares/validate');

const startDateRules = [
  query('start_date')
    .optional()
    .isDate()
    .withMessage('start_date must be a valid date'),
];

const endDateRules = [
  query('end_date')
    .optional()
    .isDate()
    .withMessage('end_date must be a valid date'),
];

const exportRules = [...startDateRules, ...endDateRules];

const exportTransactions = [...exportRules, validate];

module.exports = { exportTransactions };
