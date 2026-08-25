const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const MAX_AMOUNT = 99999999999999;

const nameRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
];

const balanceRules = [
  body('balance')
    .notEmpty()
    .withMessage('balance is required')
    .bail()
    .isInt({ min: 0, max: MAX_AMOUNT })
    .withMessage(`balance must be a positive integer between 0 and ${MAX_AMOUNT}`),
];

const createWalletRules = [...nameRules, ...balanceRules];

const updateWalletRules = createWalletRules;

const walletIdRule = (field) => [
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .bail()
    .isUUID()
    .withMessage(`${field} must be a valid UUID`),
];

const amountRules = [
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .bail()
    .isInt({ min: 1, max: MAX_AMOUNT })
    .withMessage(`amount must be a positive integer between 1 and ${MAX_AMOUNT}`),
];

const transferWalletRules = [
  ...walletIdRule('source_wallet_id'),
  ...walletIdRule('destination_wallet_id'),
  ...amountRules,
];

const walletCreate = [...createWalletRules, validate];
const walletUpdate = [...updateWalletRules, validate];
const walletTransfer = [...transferWalletRules, validate];

module.exports = { walletCreate, walletUpdate, walletTransfer };
