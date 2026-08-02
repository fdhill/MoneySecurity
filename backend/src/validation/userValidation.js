const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const createUserRules = [
  body('name')
    .trim()
    .whitelist('a-zA-Z0-9\\s')
    .notEmpty()
    .withMessage('name is required'),
  body('whatsapp_number')
    .trim()
    .notEmpty()
    .withMessage('number is required')
    .bail()
    .whitelist('a-zA-Z0-9\\s')
    .isMobilePhone('id-ID')
    .withMessage('invalid number')
    .isLength({ min: 12, max: 13 })
    .withMessage('maximum number length is 13 and minimum is 12'),
  body('role')
    .trim()
    .isInt({ min: 1, max: 2 })
    .withMessage('role must be a number')
    .bail()
    .toInt()
    .isIn([1, 2])
    .withMessage('invalid role, can only be 1 or 2'),
];

const updateUserRules = createUserRules;

const categoryCreate = [...createWalletRules, validate];
const categoryUpdate = [...updateWalletRules, validate];

module.exports = { createUserRules, updateUserRules };
