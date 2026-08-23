const { query, param } = require('express-validator');
const validate = require('../middlewares/validate');

const listActivityRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
];

const activityIdRules = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

const activityList = [...listActivityRules, validate];
const activityMarkRead = [...activityIdRules, validate];

module.exports = { activityList, activityMarkRead };
