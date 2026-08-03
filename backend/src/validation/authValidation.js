const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const loginRules = [
  body('whatsapp_number')
    .trim()
    .notEmpty()
    .withMessage('number is required')
    .bail()
    .isMobilePhone('id-ID')
    .withMessage('invalid number'),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ max: 72 })
    .withMessage('password is too long'),
];

const registerRules = [
  body('name')
    .trim()
    .whitelist('a-zA-Z0-9\\s')
    .notEmpty()
    .withMessage('name is required')
    .bail()
    .isLength({ min: 3, max: 255 })
    .withMessage('name must be between 3 and 255 characters'),
  body('whatsapp_number')
    .trim()
    .notEmpty()
    .withMessage('number is required')
    .bail()
    .isMobilePhone('id-ID')
    .withMessage('invalid number')
    .isLength({ min: 10, max: 20 })
    .withMessage('number length must be between 10 and 20 characters'),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage('password must be between 8 and 72 characters'),
];

const updateProfileRules = [
  body('name')
    .trim()
    .whitelist('a-zA-Z0-9\\s')
    .notEmpty()
    .withMessage('name is required')
    .bail()
    .isLength({ min: 3, max: 255 })
    .withMessage('name must be between 3 and 255 characters'),
  body('whatsapp_number')
    .trim()
    .notEmpty()
    .withMessage('number is required')
    .bail()
    .isMobilePhone('id-ID')
    .withMessage('invalid number')
    .isLength({ min: 10, max: 20 })
    .withMessage('number length must be between 10 and 20 characters'),
];

const changePasswordRules = [
  body('old_password')
    .notEmpty()
    .withMessage('old_password is required')
    .bail()
    .isLength({ max: 72 })
    .withMessage('old_password is too long'),
  body('new_password')
    .notEmpty()
    .withMessage('new_password is required')
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage('new_password must be between 8 and 72 characters')
    .custom((value, { req }) => value !== req.body.old_password)
    .withMessage('new_password must be different from old_password'),
];

const authLogin = [...loginRules, validate];
const authRegister = [...registerRules, validate];
const authUpdateProfile = [...updateProfileRules, validate];
const authChangePassword = [...changePasswordRules, validate];

module.exports = {
  authLogin,
  authRegister,
  authUpdateProfile,
  authChangePassword,
};
