const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const createWalletRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('balance')
    .notEmpty()
    .withMessage('balance is required')
    .isNumeric({ min: 0, max: 99999999999999 })
    .withMessage('balance must not be minus'),
];

const updateWalletRules = createWalletRules;

const categoryCreate = [...createWalletRules, validate];
const categoryUpdate = [...updateWalletRules, validate];

module.exports = { createWalletRules, updateWalletRules };
