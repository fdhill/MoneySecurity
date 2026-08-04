const { body } = require('express-validator');
const Transaction = require('../models/Transaction');
const validate = require('../middlewares/validate');

const VALID_TYPES = Object.values(Transaction.TYPE);
const MAX_AMOUNT = 99999999999999;

const createTransactionRules = [
  body('wallet_id')
    .notEmpty()
    .withMessage('wallet_id is required')
    .bail()
    .isUUID()
    .withMessage('wallet_id must be a valid UUID'),
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
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .bail()
    .isIn(VALID_TYPES)
    .withMessage('type must be either expense or income'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('description must not exceed 500 characters'),
  body('transaction_date')
    .optional()
    .isDate()
    .withMessage('transaction_date must be a valid date')
    .bail()
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (inputDate > today) {
        throw new Error('transaction_date cannot be in the future');
      }
      return true;
    }),
];

const updateTransactionRules = createTransactionRules;

const transactionCreate = [...createTransactionRules, validate];
const transactionUpdate = [...updateTransactionRules, validate];

module.exports = { transactionCreate, transactionUpdate };
