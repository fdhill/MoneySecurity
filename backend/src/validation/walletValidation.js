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

const walletCreate = [...createWalletRules, validate];
const walletUpdate = [...updateWalletRules, validate];

module.exports = { walletCreate, walletUpdate };
