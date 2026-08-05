const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const VALID_FREQUENCIES = ['monthly', 'weekly', 'yearly'];
const MAX_AMOUNT = 99999999999999;

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
    .isInt({ min: 1, max: MAX_AMOUNT })
    .withMessage(`amount must be a positive integer between 1 and ${MAX_AMOUNT}`),
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
