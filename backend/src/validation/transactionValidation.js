const { body, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const validate = require('../middlewares/validate');

const VALID_TYPES = Object.values(Transaction.TYPE);
const MAX_AMOUNT = 99999999999999;

const walletIdRules = [
  body('wallet_id')
    .notEmpty()
    .withMessage('wallet_id is required')
    .bail()
    .isUUID()
    .withMessage('wallet_id must be a valid UUID'),
];

const categoryIdRules = [
  body('category_id')
    .notEmpty()
    .withMessage('category_id is required')
    .bail()
    .isUUID()
    .withMessage('category_id must be a valid UUID'),
];

const amountRules = [
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .bail()
    .isInt({ min: 1, max: MAX_AMOUNT })
    .withMessage(`amount must be a positive integer between 1 and ${MAX_AMOUNT}`),
];

const typeRules = [
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .bail()
    .isIn(VALID_TYPES)
    .withMessage('type must be either expense or income'),
];

const descriptionRules = [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('description must not exceed 500 characters'),
];

const dateRules = [
  body('transaction_date')
    .optional()
    .isDate()
    .withMessage('transaction_date must be a valid date')
    .bail()
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (inputDate > today) {
        throw new Error('transaction_date cannot be in the future');
      }
      return true;
    }),
];

const createTransactionRules = [
  ...walletIdRules,
  ...categoryIdRules,
  ...amountRules,
  ...typeRules,
  ...descriptionRules,
  ...dateRules,
];

const updateTransactionRules = createTransactionRules;

const listTransactionRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('category_id')
    .optional()
    .isUUID()
    .withMessage('category_id must be a valid UUID'),
  query('wallet_id')
    .optional()
    .isUUID()
    .withMessage('wallet_id must be a valid UUID'),
  query('type')
    .optional()
    .isIn(VALID_TYPES)
    .withMessage('type must be either expense or income'),
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('q must not exceed 100 characters'),
];

const transactionCreate = [...createTransactionRules, validate];
const transactionUpdate = [...updateTransactionRules, validate];
const transactionList = [...listTransactionRules, validate];

module.exports = { transactionCreate, transactionUpdate, transactionList };
