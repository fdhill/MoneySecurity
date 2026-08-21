const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const nameRules = [
  body('name')
    .trim()
    .whitelist('a-zA-Z0-9\\s')
    .notEmpty()
    .withMessage('name is required')
    .bail()
    .isLength({ min: 3, max: 255 })
    .withMessage('name must be between 3 and 255 characters'),
];

const emailRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .bail()
    .isEmail()
    .withMessage('invalid email')
    .normalizeEmail(),
];

const optionalPhoneRules = [
  body('phone_number')
    .optional({ values: 'falsy' })
    .trim()
    .isMobilePhone('id-ID')
    .withMessage('invalid number')
    .isLength({ min: 10, max: 20 })
    .withMessage('number length must be between 10 and 20 characters'),
];

const createUserRules = [
  ...nameRules,
  ...emailRules,
  ...optionalPhoneRules,
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage('password must be between 8 and 72 characters'),
  body('role')
    .trim()
    .isInt({ min: 1, max: 2 })
    .withMessage('role must be a number')
    .bail()
    .toInt()
    .isIn([1, 2])
    .withMessage('invalid role, can only be 1 or 2'),
];

const updateUserRules = [...nameRules, ...optionalPhoneRules];

const userCreate = [...createUserRules, validate];
const userUpdate = [...updateUserRules, validate];

module.exports = { userCreate, userUpdate };
