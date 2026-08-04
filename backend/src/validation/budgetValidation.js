const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const VALID_FREQUENCIES = ['monthly', 'weekly', 'yearly'];

const createBudgetRules = [
  body('category_id')
    .notEmpty()
    .withMessage('category_id is required')
    .bail()
    .isUUID()
    .withMessage('category_id must be a valid UUID'),
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .bail()
    .isNumeric({ min: 1, max: 99999999999999 })
    .withMessage('amount must be a positive number'),
  body('frequency')
    .notEmpty()
    .withMessage('frequency is required')
    .bail()
    .isIn(VALID_FREQUENCIES)
    .withMessage('frequency must be monthly, weekly, or yearly'),
  body('is_recurring')
    .optional()
    .isBoolean()
    .withMessage('is_recurring must be a boolean'),
];

const updateBudgetRules = createBudgetRules;

const budgetCreate = [...createBudgetRules, validate];
const budgetUpdate = [...updateBudgetRules, validate];

module.exports = { budgetCreate, budgetUpdate };
